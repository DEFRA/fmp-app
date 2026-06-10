import { test as base } from '@playwright/test'
import { FormDriver } from './test-runner-api/form-driver.js'
import { MapDriver } from './test-runner-api/map-driver.js'
import { PdfDriver } from './test-runner-api/pdf-driver.js'

export const test = base.extend({
  steps: async ({ page }, run) => {
    await run(new FormDriver(page))
  },
  mapSteps: async ({ page }, run) => {
    await run(new MapDriver(page))
  },
  pdfDriver: async ({ page }, run) => {
    await run(new PdfDriver(page))
  },
})

export { expect } from '@playwright/test'
