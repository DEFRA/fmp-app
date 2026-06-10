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
    ...(isCi ? [['github']] : []),
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['html', { open: isCi ? 'never' : 'always' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
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
        grepInvert: /@internal|@urlCheck|@e2e/,
        use: {
          ...browserProject.use,
          baseURL: publicBaseURL,
        },
      },
      {
        name: `internal-${browserProject.suffix}`,
        grep: /@internal/,
        grepInvert: /@urlCheck|@e2e/,
        use: {
          ...browserProject.use,
          baseURL: internalBaseURL,
        },
      },
    ]),
    {
      name: 'noDeps-local-chromium',
      grep: /@noDeps/,
      grepInvert: /@urlCheck|@internal|@e2e/,
      use: {
        ...chromeConfig,
        baseURL: publicBaseURL,
      },
    },
    {
      name: 'urlCheck-chromium',
      grep: /@urlCheck/,
      use: {
        ...chromeConfig,
        baseURL: publicBaseURL,
      },
    },
    {
      name: 'e2e-public-chromium',
      grep: /@e2e/,
      use: {
        ...chromeConfig,
        baseURL: publicBaseURL,
      },
    },
    {
      name: 'e2e-internal-chromium',
      grep: /@e2e/,
      use: {
        ...chromeConfig,
        baseURL: internalBaseURL,
      },
    },
  ],
})
