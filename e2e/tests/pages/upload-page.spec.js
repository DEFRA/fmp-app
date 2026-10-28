import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'
import { validBoundaryFiles, invalidBoundaryFiles } from '../../data/upload-data.js'

test.describe('upload page', () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.upload.page)
  })

  test('displays the correct page title', { tag: '@noDeps' }, async ({ steps }) => {
    await steps.expectOn(pages.upload.page)
  })

  test('map page link is present', { tag: '@noDeps' }, async ({ steps }) => {
    await steps.clickDetails(pages.upload.noBoundaryDetails)
    await steps.expectLinkExists(pages.upload.mapPage)
  })

  // Data driven tests for valid boundary files
  for (const { type, path } of validBoundaryFiles) {
    test(`uploading a ${type} boundary file`, async ({ steps }) => {
      await steps.chooseFile(path)
      await steps.clickButton(pages.upload.continueButton)
      await steps.expectOn(pages.map.page)
    })
  }

  test('shows validation error when continuing without uploading a file', { tag: '@noDeps' }, async ({ steps }) => {
    await steps.clickButton(pages.upload.continueButton)
    await steps.expectErrorText(pages.upload.missingFileError)
  })

  // Data driven tests for files that trigger an upload error
  for (const { description, path, error } of invalidBoundaryFiles) {
    test(`shows an error for ${description}`, { tag: '@noDeps' }, async ({ steps }) => {
      await steps.chooseFile(path)
      await steps.clickButton(pages.upload.continueButton)
      await steps.expectErrorText(pages.upload[error])
    })
  }
})
