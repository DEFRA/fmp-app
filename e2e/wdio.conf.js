import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import allureReporter from '@wdio/allure-reporter'
import findFilesWithOnly from './utils/find-specs-with-only.js'

const fileName = fileURLToPath(import.meta.url)
const fileDir = path.dirname(fileName)

const isCi = Boolean(process.env.CI)
const baseUrl = process.env.INTERNAL ? process.env.INTERNAL_BASE_URL : process.env.BASE_URL
if (!baseUrl) {
  throw new Error('BASE_URL environment variable is required')
}

const selectedBrowser = (process.env.BROWSER || 'chrome').toLowerCase()

const isHeadless = String(process.env.HEADLESS ?? 'true').toLowerCase() !== 'false'
const TIMEOUT_MINUTES = 20
const MS_PER_MINUTE = 60 * 1000

const useLocalChromeDriver = !isCi
const localChromeDriverPath = path.resolve(fileDir, 'node_modules/chromedriver/bin/chromedriver')
const CI_MAX_INSTANCES = 2
const LOCAL_MAX_INSTANCES = 5
const REPORTER_SYNC_TIMEOUT_MS = TIMEOUT_MINUTES * MS_PER_MINUTE
const VIDEO_RENDER_TIMEOUT_MS = TIMEOUT_MINUTES * MS_PER_MINUTE

const browserCapability = (() => {
  if (selectedBrowser === 'chrome') {
    return {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: [
          ...(isHeadless ? ['--headless=new'] : []),
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--use-angle=swiftshader', // Enable WebGL in headless mode
          '--ignore-gpu-blocklist',
        ]
      },
      ...(useLocalChromeDriver
        ? { 'wdio:chromedriverOptions': { binary: localChromeDriverPath } }
        : {})
    }
  }

  if (selectedBrowser === 'firefox') {
    return {
      browserName: 'firefox',
      'moz:firefoxOptions': {
        args: isHeadless ? ['-headless'] : []
      }
    }
  }

  if (['edge', 'msedge', 'microsoftedge'].includes(selectedBrowser)) {
    return {
      browserName: 'MicrosoftEdge',
      'ms:edgeOptions': {
        args: [
          ...(isHeadless ? ['--headless'] : []),
          '--window-size=1280,720',
          '--disable-gpu'
        ]
      }
    }
  }

  return { browserName: selectedBrowser }
})()

// Keep video frames off Jenkins workspace / network disk
const videoFramesDir = path.join(os.tmpdir(), 'wdio-video-reporter-frames')

// Where to keep final artifacts in the workspace
const resultsDir = path.resolve(__dirname, '_results_')
const screenshotsDir = path.join(resultsDir, 'screenshots')

// use util to detect focused `.only` markers in specs

const defaultSpecs = ['./tests/**/*.js']
const onlySpecs = findFilesWithOnly(path.resolve(fileDir, 'tests'), fileDir)

export const config = {
  specs: onlySpecs.length ? onlySpecs : defaultSpecs,
  exclude: [],

  maxInstances: isCi ? CI_MAX_INSTANCES : LOCAL_MAX_INSTANCES,

  capabilities: [browserCapability],

  logLevel: 'error',
  baseUrl,

  reporterSyncTimeout: REPORTER_SYNC_TIMEOUT_MS, // 20 minutes
  reporterSyncInterval: 200,

  // Retry failed tests in CI environment
  specFileRetries: isCi ? 2 : 1,
  specFileRetriesDelay: 0,

  waitforTimeout: 120000,
  connectionRetryTimeout: 600000,
  connectionRetryCount: 2,

  reporters: [
    'spec',

    ['video', {
      saveAllVideos: false,

      // If you retry specs, don't waste time rendering earlier failures
      onlyRecordLastFailure: true,

      outputDir: path.join(resultsDir, 'videos'),

      // Put *frames* on a fast disk
      rawPath: videoFramesDir,

      // Reduce encode cost
      videoScale: '800:trunc(ow/a/2)*2',
      videoFormat: 'mp4',

      videoRenderTimeout: VIDEO_RENDER_TIMEOUT_MS, // 20 minutes

      // These are the default commands that trigger a snapshot (and potential video clip split)
      snapshotCommands: [
        'url',
        'click',
        'value',
        'keys',
        'execute',
        'submit',
        'clear',
        'back',
        'forward',
        'refresh',
        'accept_alert',
        'dismiss_alert',
        'scroll'
      ]
    }],

    ['allure', {
      outputDir: path.join(resultsDir, 'allure-raw'),
      disableWebdriverStepsReporting: true,
      disableWebdriverScreenshotsReporting: true
    }],

    ['junit', {
      outputDir: path.join(resultsDir, 'junit'),
      outputFileFormat: function (options) {
        return `wdio-junit-${options.cid}.xml`
      }
    }]
  ],

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
    grep: process.env.MOCHA_GREP,
    invert: process.env.MOCHA_INVERT === 'true'
  },

  before: async function () {
    try {
      await browser.maximizeWindow()
    } catch (err) {
      console.warn('Unable to maximize browser window:', err)
    }
  },

  afterTest: async function (test, { passed } = {}) {
    if (!passed) {
      try {
        fs.mkdirSync(screenshotsDir, { recursive: true })
        const stamp = new Date().toISOString().replaceAll(/[:.]/g, '-')
        const filename = `${test?.title || 'test'}-${stamp}.png`
        const filePath = path.join(screenshotsDir, filename)

        await browser.saveScreenshot(filePath)

        // Attach a single failure screenshot to Allure (without enabling global screenshot reporting)
        try {
          const buf = fs.readFileSync(filePath)
          allureReporter.addAttachment('Failure screenshot', buf, 'image/png')
        } catch (err) {
          console.warn('Unable to attach screenshot to Allure:', err)
        }
      } catch (err) {
        console.warn('Unable to capture failure screenshot:', err)
      }
    }

    try {
      await browser.deleteCookies()
    } catch (err) {
      console.warn('Unable to delete browser cookies:', err)
    }
  }
}
