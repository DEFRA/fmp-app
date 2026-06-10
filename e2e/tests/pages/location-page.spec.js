import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'
import { invalidLocationData } from '../../data/validation-data/invalid-location-data.js'

test.describe('Location page', () => {
  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.location.page)
  })

  test('navigates to map page after entering postcode and submitting', async ({ steps }) => {
    await steps.choose(pages.location.findByPostcode)
    await steps.type(pages.location.placeOrPostcodeInput, 'BS1 5AH')
    await steps.submit()
    await steps.expectOn(pages.map.page)
  })

  test('navigates to map page after entering place name and submitting', async ({ steps }) => {
    await steps.choose(pages.location.findByPostcode)
    await steps.type(pages.location.placeOrPostcodeInput, 'Bristol')
    await steps.submit()
    await steps.expectOn(pages.map.page)
  })

  test('navigates to map page after entering NGR and submitting', async ({ steps }) => {
    await steps.choose(pages.location.findByNgr)
    await steps.type(pages.location.ngrInput, 'ST 57877 72653')
    await steps.submit()
    await steps.expectOn(pages.map.page)
  })

  test('navigates to map page after entering Easting and Northing and submitting', async ({ steps }) => {
    await steps.choose(pages.location.findByEastingNorthing)
    await steps.type(pages.location.eastingInput, '357877')
    await steps.type(pages.location.northingInput, '172653')
    await steps.submit()
    await steps.expectOn(pages.map.page)
  })

  test('shows validation error when submitting without entering postcode', { tag: ['@noDeps'] }, async ({ steps }) => {
    await steps.submit()
    await steps.expectErrorText(pages.location.missingSelectionError)
  })

  // Data driven test for invalid postcode inputs - returns 'Enter a real place name or postcode' error
  for (const { search } of invalidLocationData.invalidPostcodeSearchData) {
    test(`shows 'Enter a real place name or postcode' error for input: "${search}"`, { tag: '@noDeps' }, async ({ steps }) => {
      await steps.choose(pages.location.findByPostcode)
      await steps.type(pages.location.placeOrPostcodeInput, search)
      await steps.submit()
      await steps.expectErrorText(pages.location.invalidPostcodeError)
    })
  }

  // Data driven test for inputs that return 'No address found for that place name or postcode' error
  for (const { search } of invalidLocationData.noAddressFoundSearchData) {
    test(`shows 'No address found for that place name or postcode' error for input: "${search}"`, async ({ steps }) => {
      await steps.choose(pages.location.findByPostcode)
      await steps.type(pages.location.placeOrPostcodeInput, search)
      await steps.submit()
      await steps.expectErrorText(pages.location.noAddressFoundError)
    })
  }

  // Data driven test for non-England postcode inputs
  for (const { search } of invalidLocationData.nonEnglandSearchData) {
    test(`shows 'England only' page for input: "${search}"`, async ({ steps }) => {
      await steps.choose(pages.location.findByPostcode)
      await steps.type(pages.location.placeOrPostcodeInput, search)
      await steps.submit()
      await steps.expectOn(pages.englandOnly.page)
    })
  }

  // Data driven test for NGR inputs that return 'Enter a real National Grid Reference (NGR)' error
  for (const { search } of invalidLocationData.invalidNGRData) {
    test(`shows 'Enter a real National Grid Reference (NGR)' error for input: "${search}"`, { tag: '@noDeps' }, async ({ steps }) => {
      await steps.choose(pages.location.findByNgr)
      await steps.type(pages.location.ngrInput, search)
      await steps.submit()
      await steps.expectErrorText(pages.location.invalidNgrError)
    })
  }

  // Data driven test for non-England NGR inputs
  for (const { search } of invalidLocationData.nonEnglandNGRData) {
    test(`shows 'England only' page for NGR input:"${search}"`, async ({ steps }) => {
      await steps.choose(pages.location.findByNgr)
      await steps.type(pages.location.ngrInput, search)
      await steps.submit()
      await steps.expectOn(pages.englandOnly.page)
    })
  }

  // Data driven test for Easting and Northing inputs that return 'Enter an easting/northing' error
  for (const { searchEasting, searchNorthing } of invalidLocationData.invalidCharactersEastingNorthingData) {
    test(`shows 'Enter an easting/northing' error for Easting and Northing input with invalid characters: "${searchEasting}, ${searchNorthing}"`, { tag: '@noDeps' }, async ({ steps }) => {
      await steps.choose(pages.location.findByEastingNorthing)
      await steps.type(pages.location.eastingInput, searchEasting)
      await steps.type(pages.location.northingInput, searchNorthing)
      await steps.submit()
      await steps.expectErrorText(pages.location.missingEastingError)
      await steps.expectErrorText(pages.location.missingNorthingError)
    })
  }

  // Data driven test for Easting and Northing inputs that return 'Enter an easting/northing in the correct format' error
  for (const { searchEasting, searchNorthing } of invalidLocationData.invalidEastingNorthingData) {
    test(`shows 'Enter an easting/northing in the correct format' error for Easting and Northing input:"${searchEasting}, ${searchNorthing}"`, { tag: '@noDeps' }, async ({ steps }) => {
      await steps.choose(pages.location.findByEastingNorthing)
      await steps.type(pages.location.eastingInput, searchEasting)
      await steps.type(pages.location.northingInput, searchNorthing)
      await steps.submit()
      await steps.expectErrorText(pages.location.invalidEastingError)
      await steps.expectErrorText(pages.location.invalidNorthingError)
    })
  }

  // Data driven test for non-England Easting and Northing inputs
  for (const { searchEasting, searchNorthing } of invalidLocationData.nonEnglandEastingData) {
    test(`shows 'England only' page for Easting and Northing input:"${searchEasting}, ${searchNorthing}"`, async ({ steps }) => {
      await steps.choose(pages.location.findByEastingNorthing)
      await steps.type(pages.location.eastingInput, searchEasting)
      await steps.type(pages.location.northingInput, searchNorthing)
      await steps.submit()
      await steps.expectOn(pages.englandOnly.page)
    })
  }
  // Verifies Skip to map link is present and navigates to map page when clicked

  test('allows users to skip location selection and go directly to map page', { tag: ['@noDeps'] }, async ({ steps }) => {
    await steps.clickLink(pages.location.skipToMapLink)
    await steps.expectOn(pages.map.page)
  })
})
