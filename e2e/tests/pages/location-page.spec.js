import { Steps } from '../../test-runner-api/steps.js'
import { pages } from '../../pages/index.js'
import { invalidLocationData } from '../../data/validation-data/invalid-location-data.js'

describe('Location page', () => {
  let steps

  beforeEach(async () => {
    steps = new Steps()
    await steps.open(pages.location.page)
  })

  it('navigates to map page after entering postcode and submitting @routing', async () => {
    await steps.choose(pages.location.findByPostcode)
    await steps.type(pages.location.placeOrPostcodeInput, 'BS1 5AH')
    await steps.submit()
    await steps.expectOn(pages.map.page)
  })
  it('navigates to map page after entering place name and submitting @routing', async () => {
    await steps.choose(pages.location.findByPostcode)
    await steps.type(pages.location.placeOrPostcodeInput, 'Bristol')
    await steps.submit()
    await steps.expectOn(pages.map.page)
  })
  it('navigates to map page after entering NGR and submitting @routing', async () => {
    await steps.choose(pages.location.findByNgr)
    await steps.type(pages.location.ngrInput, 'ST 57877 72653')
    await steps.submit()
    await steps.expectOn(pages.map.page)
  })
  it('navigates to map page after entering Easting and Northing and submitting @routing', async () => {
    await steps.choose(pages.location.findByEastingNorthing)
    await steps.type(pages.location.eastingInput, '357877')
    await steps.type(pages.location.northingInput, '172653')
    await steps.submit()
    await steps.expectOn(pages.map.page)
  })

  it('shows validation error when submitting without entering postcode @validation @noDeps', async () => {
    await steps.submit()
    await steps.expectErrorText(pages.location.missingSelectionError)
  })

  // Data driven test for invalid postcode inputs - returns 'Enter a real place name or postcode' error
  invalidLocationData.invalidPostcodeSearchData.forEach(({ search }) => {
    it(`shows 'Enter a real place name or postcode' error for input: "${search}" @validation @noDeps`, async () => {
      await steps.choose(pages.location.findByPostcode)
      await steps.type(pages.location.placeOrPostcodeInput, search)
      await steps.submit()
      await steps.expectErrorText(pages.location.invalidPostcodeError)
    })
  })

  // Data driven test for inputs that return 'No address found for that place name or postcode' error
  invalidLocationData.noAddressFoundSearchData.forEach(({ search }) => {
    it(`shows 'No address found for that place name or postcode' error for input: "${search}" @validation`, async () => {
      await steps.choose(pages.location.findByPostcode)
      await steps.type(pages.location.placeOrPostcodeInput, search)
      await steps.submit()
      await steps.expectErrorText(pages.location.noAddressFoundError)
    })
  })

  // Data driven test for non-England postcode inputs
  invalidLocationData.nonEnglandSearchData.forEach(({ search }) => {
    it(`shows 'England only' page for input: "${search}" @validation`, async () => {
      await steps.choose(pages.location.findByPostcode)
      await steps.type(pages.location.placeOrPostcodeInput, search)
      await steps.submit()
      await steps.expectOn(pages.englandOnly.page)
    })
  })

  // Data driven test for NGR inputs that return 'Enter a real National Grid Reference (NGR)' error
  invalidLocationData.invalidNGRData.forEach(({ search }) => {
    it(`shows 'Enter a real National Grid Reference (NGR)' error for input: "${search}" @validation @noDeps`, async () => {
      await steps.choose(pages.location.findByNgr)
      await steps.type(pages.location.ngrInput, search)
      await steps.submit()
      await steps.expectErrorText(pages.location.invalidNgrError)
    })
  })

  // Data driven test for non-England NGR inputs
  invalidLocationData.nonEnglandNGRData.forEach(({ search }) => {
    it(`shows 'England only' page for NGR input:"${search}" @validation`, async () => {
      await steps.choose(pages.location.findByNgr)
      await steps.type(pages.location.ngrInput, search)
      await steps.submit()
      await steps.expectOn(pages.englandOnly.page)
    })
  })

  // Data driven test for Easting and Northing inputs that return 'Enter an easting/northing' error
  invalidLocationData.invalidCharactersEastingNorthingData.forEach(({ searchEasting, searchNorthing }) => {
    it(`shows 'Enter an easting/northing' error for Easting and Northing input with invalid characters: "${searchEasting}, ${searchNorthing}" @validation @noDeps`, async () => {
      await steps.choose(pages.location.findByEastingNorthing)
      await steps.type(pages.location.eastingInput, searchEasting)
      await steps.type(pages.location.northingInput, searchNorthing)
      await steps.submit()
      await steps.expectErrorText(pages.location.missingEastingError)
      await steps.expectErrorText(pages.location.missingNorthingError)
    })
  })

  // Data driven test for Easting and Northing inputs that return 'Enter an easting/northing in the correct format' error
  invalidLocationData.invalidEastingNorthingData.forEach(({ searchEasting, searchNorthing }) => {
    it(`shows 'Enter an easting/northing in the correct format' error for Easting and Northing input:"${searchEasting}, ${searchNorthing}" @validation @noDeps`, async () => {
      await steps.choose(pages.location.findByEastingNorthing)
      await steps.type(pages.location.eastingInput, searchEasting)
      await steps.type(pages.location.northingInput, searchNorthing)
      await steps.submit()
      await steps.expectErrorText(pages.location.invalidEastingError)
      await steps.expectErrorText(pages.location.invalidNorthingError)
    })
  })

  // Data driven test for non-England Easting and Northing inputs
  invalidLocationData.nonEnglandEastingData.forEach(({ searchEasting, searchNorthing }) => {
    it(`shows 'England only' page for Easting and Northing input:"${searchEasting}, ${searchNorthing}" @validation`, async () => {
      await steps.choose(pages.location.findByEastingNorthing)
      await steps.type(pages.location.eastingInput, searchEasting)
      await steps.type(pages.location.northingInput, searchNorthing)
      await steps.submit()
      await steps.expectOn(pages.englandOnly.page)
    })
  })
  // Verifies Skip to map link is present and navigates to map page when clicked
  it('allows users to skip location selection and go directly to map page @routing @noDeps', async () => {
    await steps.clickLink(pages.location.skipToMapLink)
    await steps.expectOn(pages.map.page)
  })
})
