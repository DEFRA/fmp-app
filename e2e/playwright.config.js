import path from 'node:path'
import { defineConfig } from '@playwright/test'
import environments from './environments.js'

const isCi = Boolean(process.env.CI)
const selectedEnv = process.env.TEST_ENV || (isCi ? 'local' : 'tst')
const env = environments[selectedEnv]

if (!env && !process.env.BASE_URL && !process.env.INTERNAL_BASE_URL) {
  throw new Error(`Unknown TEST_ENV "${selectedEnv}". Available: ${Object.keys(environments).join(', ')}`)
}

const baseURL = process.env.INTERNAL
  ? (process.env.INTERNAL_BASE_URL || env?.internalBaseUrl)
  : (process.env.BASE_URL || env?.baseUrl)

if (!baseURL) {
  throw new Error('Could not determine base URL. Set TEST_ENV, BASE_URL, or INTERNAL_BASE_URL.')
}

const browserKey = (process.env.BROWSER || 'chrome').toLowerCase()
const browserConfigByKey = {
  chrome: { browserName: 'chromium', channel: 'chrome' },
  firefox: { browserName: 'firefox' },
  edge: { browserName: 'chromium', channel: 'msedge' },
  msedge: { browserName: 'chromium', channel: 'msedge' },
  microsoftedge: { browserName: 'chromium', channel: 'msedge' },
}
const browserConfig = browserConfigByKey[browserKey] || { browserName: 'chromium' }

const isHeadless = String(process.env.HEADLESS ?? 'true').toLowerCase() !== 'false'
const resultsDir = '_results_'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 2 : 5,
  timeout: 60000,

  reporter: [
    ['list'],
    ['junit', { outputFile: path.join(resultsDir, 'junit', 'playwright-junit.xml') }],
    ['html', { open: 'never', outputFolder: path.join(resultsDir, 'html-report') }],
  ],

  use: {
    baseURL,
    headless: isHeadless,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 5000,
  },

  projects: [
    {
      name: browserConfig.browserName,
      use: {
        ...browserConfig,
      },
    },
  ],

  outputDir: path.join(resultsDir, 'test-output'),
})
