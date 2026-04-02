import path from 'node:path'
import { defineConfig } from '@playwright/test'
import { environments } from './environments.js'

const isCi = Boolean(process.env.CI)
const selectedEnv = process.env.TEST_ENV || (isCi ? 'local' : 'tst')
const env = environments[selectedEnv]

if (!env) {
  throw new Error(`Unknown TEST_ENV "${selectedEnv}". Available: ${Object.keys(environments).join(', ')}`)
}

const publicBaseURL = env.baseUrl
const internalBaseURL = env.internalBaseUrl

const chromeConfig = {
  browserName: 'chromium',
  channel: 'chrome',
  ignoreDefaultArgs: ['--disable-gpu'],
  launchOptions: {
    args: [
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader'
    ],
  },
}

if (!publicBaseURL || !internalBaseURL) {
  throw new Error(`Missing base URL config for TEST_ENV "${selectedEnv}". Check environments.js.`)
}

const browserProjects = [
  { suffix: 'chromium', use: chromeConfig },
  { suffix: 'firefox', use: { browserName: 'firefox' } },
  { suffix: 'webkit', use: { browserName: 'webkit' } },
]

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 2 : 5,
  timeout: 60000,

  reporter: [
    ['list'],
    ['junit', { outputFile: path.join('playwright-report', 'playwright-junit.xml') }],
    ['html', { open: isCi ? 'never' : 'always' }],
  ],

  use: {
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 5000,
  },

  projects: [
    ...browserProjects.flatMap((browserProject) => [
      {
        name: `public-${browserProject.suffix}`,
        grepInvert: /@internal|@urlCheck/,
        use: {
          ...browserProject.use,
          baseURL: publicBaseURL,
        },
      },
      {
        name: `internal-${browserProject.suffix}`,
        grep: /@internal|@both/,
        grepInvert: /@urlCheck/,
        use: {
          ...browserProject.use,
          baseURL: internalBaseURL,
        },
      },
    ]),
    {
      name: 'noDeps-local-chrome',
      grep: /@noDeps/,
      grepInvert: /@urlCheck|@internal|@both/,
      use: {
        ...chromeConfig,
        baseURL: publicBaseURL,
      },
    },
    {
      name: 'urlCheck-chrome',
      grep: /@urlCheck/,
      use: {
        ...chromeConfig,
        baseURL: publicBaseURL,
      },
    },
  ],
})
