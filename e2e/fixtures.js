import { test as base } from '@playwright/test'
import { FormDriver } from './test-runner-api/form-driver.js'
import { MapDriver } from './test-runner-api/map-driver.js'

export const test = base.extend({
  steps: async ({ page }, use) => {
    await use(new FormDriver(page))
  },
  mapSteps: async ({ page }, use) => {
    await use(new MapDriver(page))
  },
})

export { expect } from '@playwright/test'
