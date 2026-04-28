const { submitGetRequest } = require('../../__test-helpers__/server')
const { getPsoContactsByPolygon } = require('../../services/pso-contact-by-polygon')
const { getFloodDataByPolygon } = require('../../services/floodDataByPolygon')
const shapeUtils = require('../../services/shape-utils')
const { config } = require('../../../config')
const { encode } = require('@mapbox/polyline')
const { getProductOnePause } = require('../../services/getProductOnePause')
const { isEnglandService } = require('../../services/is-england')
jest.mock('../../services/agol/__mocks__/getContacts')
jest.mock('../../services/agol/getFloodZones')
jest.mock('../../services/agol/getFloodZonesClimateChange')
jest.mock('../../services/riskAdmin/isRiskAdminArea')
jest.mock('../../services/agol/getSurfaceWater')
jest.mock('../../services/floodDataByPolygon.js')
jest.mock('../../services/pso-contact-by-polygon.js')
jest.mock('../../services/getProductOnePause')
jest.mock('../../services/is-england')

const getAreaInHectaresSpy = jest.spyOn(shapeUtils, 'getAreaInHectares')
const url = '/results'
let increment = 0
const INCREMENT_VALUE = 100

const polygon = [[11, 11], [11, 12], [12, 12], [12, 11], [11, 11]]

// getUniquePolygonQuery is used to bust the cache, so that each test uses a unique polygon
const getUniquePolygonQuery = () => {
  increment += INCREMENT_VALUE
  const result = `polygon=${JSON.stringify(polygon.map(([x, y]) => [increment + x, increment + y]))}`
  return result
}

const queryParams = [
  ['encoded polygon', `encodedPolygon=${encode([[111, 111], [111, 112], [112, 112], [112, 111], [111, 111]])}`],
  ['polygon', 'polygon=[[111, 111], [111, 112], [112, 112], [112, 111], [111, 111]]']
]
/*
This test file is used to check the dynamic content on the results page html.
It is useful as we need to test the nunjuck logic.
*/
describe('Results page', () => {
  it('should redirect to England only page if polygon is outside England', async () => {
    isEnglandService.mockResolvedValueOnce(false)
    const response = await submitGetRequest({ url: `${url}?${getUniquePolygonQuery()}` }, null, 302)
    expect(response.statusCode).toEqual(302)
    expect(response.headers.location).toEqual('/england-only')
  })

  // Checking to ensure both standard polygons and encoded polygons work in query params.
  it.each(queryParams)('should return page if query includes %s', async (desc, queryParam) => {
    getProductOnePause.mockReturnValueOnce({ dateWithinPausePeriod: null, pauseP1DownloadTo: null })
    getPsoContactsByPolygon.mockResolvedValue({
      isEngland: true,
      EmailAddress: 'emdenquiries@environment-agency.gov.uk',
      AreaName: 'East Midlands',
      useAutomatedService: true,
      LocalAuthorities: 'Derbyshire Dales'
    })
    getFloodDataByPolygon.mockResolvedValue({
      floodzone_2: false,
      floodzone_3: false,
      floodZone: '1',
      floodZoneLevel: 'low',
      floodZoneClimateChange: false,
      floodZoneClimateChangeNoData: true,
      surfaceWater: {
        riskBandId: -1,
        riskBand: false,
        riskBandPercent: null,
        riskBandOdds: null
      },
      isRiskAdminArea: false
    })
    getAreaInHectaresSpy.mockReturnValue(0)
    const response = await submitGetRequest({ url: `${url}?${queryParam}` })

    expect(response.statusCode).toEqual(200)
  })

  describe('pause P1 download', () => {
    it('should pass pause P1 download data to the view', async () => {
      Date.now = jest.fn(() => 1764258880000)
      getProductOnePause.mockReturnValueOnce({ dateWithinPausePeriod: true, pauseP1DownloadTo: '5.38pm on Thursday 27 November 2025' })
      getPsoContactsByPolygon.mockResolvedValue({})
      getFloodDataByPolygon.mockResolvedValue({})
      const response = await submitGetRequest({ url: `${url}?${getUniquePolygonQuery()}` })
      const pageContent = response.payload
      expect(pageContent).toContain('You will be able to use the service from 5.38pm on Thursday 27 November 2025.')
    })
  })

  describe('On Public', () => {
    beforeAll(() => { config.appType = 'public' })
    beforeEach(() => { getProductOnePause.mockReturnValueOnce({ dateWithinPausePeriod: false, pauseP1DownloadTo: null }) })
    afterAll(() => { config.appType = 'internal' })

    describe('Flood zone 1', () => {
      it('should show FZ1 title and Rivers bullet point, zone 1 relevant text (no FRA) when <1ha drawn', async () => {
        getPsoContactsByPolygon.mockResolvedValue({
          isEngland: true,
          EmailAddress: 'emdenquiries@environment-agency.gov.uk',
          AreaName: 'East Midlands',
          useAutomatedService: true,
          LocalAuthorities: 'Derbyshire Dales'
        })
        getFloodDataByPolygon.mockResolvedValue({
          floodzone_2: false,
          floodzone_3: false,
          floodZone: '1',
          floodZoneLevel: 'low',
          floodZoneClimateChange: false,
          floodZoneClimateChangeNoData: true,
          surfaceWater: {
            riskBandId: -1,
            riskBand: false,
            riskBandPercent: null,
            riskBandOdds: null
          },
          isRiskAdminArea: false,
          hasSeaSource: false,
          hasRiversSource: true,
          floodSource: 'rivers'
        })
        getAreaInHectaresSpy.mockReturnValue(0)
        const response = await submitGetRequest({ url: `${url}?${getUniquePolygonQuery()}` })
        const pageContent = getElementByIdAndFormat(response.payload)
        expect(pageContent.heading).toEqual(getHeadingAndMeaningText(1).heading)
        expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(1).meaning)
        expect(pageContent.riskFloodingFrom).toEqual(riskFloodingFromText)
        expect(pageContent.riversBulletPoint).toEqual(riversBulletPointText)
        expect(pageContent.seaBulletPoint).toEqual(false)
        expect(pageContent.fz1DataUnlikely).toEqual(fz1DataUnlikelyText)
        expect(pageContent.fz1FRAOnlyNeededWhen).toEqual(fz1FRAOnlyNeededWhenText)
        expect(pageContent.fzProbability).toEqual(getFZProbabilityText(1, 'low'))
        expect(pageContent.rsSummaryTitle).toEqual(rsSummaryTitleText)
        expect(pageContent.orderP4Button).toEqual(orderP4ButtonText)
        expect(pageContent.siteDrawnIsLessThan).toEqual(siteDrawnIsLessThanText)
        expect(pageContent.siteDrawnIsLessThanCC).toEqual(false)
        expect(pageContent.fraRequired).toEqual(false)
        expect(pageContent.riskWhenCC).toEqual(false)
        expect(response.statusCode).toEqual(200)
      })

      it('should show FZ1 title, zone 1 relevant text (no FRA) when <1ha drawn with Surface Water bullet point', async () => {
        getAreaInHectaresSpy.mockReturnValue(100)
        getPsoContactsByPolygon.mockResolvedValue({
          isEngland: true,
          EmailAddress: 'emdenquiries@environment-agency.gov.uk',
          AreaName: 'East Midlands',
          useAutomatedService: true,
          LocalAuthorities: 'Derbyshire Dales'
        })
        getFloodDataByPolygon.mockResolvedValue({
          floodzone_2: false,
          floodzone_3: false,
          floodZone: '1',
          floodZoneLevel: 'low',
          floodZoneClimateChange: false,
          floodZoneClimateChangeNoData: false,
          surfaceWater: {
            riskBandId: 3,
            riskBand: 'High',
            riskBandPercent: '3.3',
            riskBandOdds: '1 in 30'
          },
          isRiskAdminArea: false,
          hasSeaSource: false,
          hasRiversSource: true,
          floodSource: 'rivers'
        })
        const response = await submitGetRequest({ url: `${url}?${getUniquePolygonQuery()}` })
        const pageContent = getElementByIdAndFormat(response.payload)
        expect(pageContent.heading).toEqual(getHeadingAndMeaningText(1).heading)
        expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(1).meaning)
        expect(pageContent.riversBulletPoint).toEqual(riversBulletPointText)
        expect(pageContent.swBulletPoint).toEqual(swBulletPointText)
        expect(pageContent.fz1DataUnlikely).toEqual(fz1DataUnlikelyText)
        expect(pageContent.rsSummaryTitle).toEqual(rsSummaryTitleText)
        expect(pageContent.orderP4Button).toEqual(orderP4ButtonText)
      })

      it('should show RS title and bullet point, zone 1 relevant text (FRA required) when >1ha drawn', async () => {
        getPsoContactsByPolygon.mockResolvedValue({
          isEngland: true,
          EmailAddress: 'emdenquiries@environment-agency.gov.uk',
          AreaName: 'East Midlands',
          useAutomatedService: true,
          LocalAuthorities: 'Derbyshire Dales'
        })
        getFloodDataByPolygon.mockResolvedValue({
          floodzone_2: false,
          floodzone_3: false,
          floodZone: '1',
          floodZoneLevel: 'low',
          floodZoneClimateChange: false,
          floodZoneClimateChangeNoData: false,
          surfaceWater: {
            riskBandId: -1,
            riskBand: false,
            riskBandPercent: null,
            riskBandOdds: null
          },
          isRiskAdminArea: false,
          hasSeaSource: false,
          hasRiversSource: true,
          floodSource: 'rivers'
        })
        getAreaInHectaresSpy.mockReturnValue(123.43)
        const response = await submitGetRequest({ url: `${url}?${getUniquePolygonQuery()}` })
        const pageContent = getElementByIdAndFormat(response.payload)
        expect(pageContent.heading).toEqual(getHeadingAndMeaningText(1).heading)
        expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(1).meaning)
        expect(pageContent.fraRequired).toEqual(fraRequiredText)
        expect(pageContent.fz1DataUnlikely).toEqual(fz1DataUnlikelyText)
        expect(pageContent.fzProbability).toEqual(getFZProbabilityText(1, 'low'))
        expect(pageContent.fz1GreaterThan).toEqual(fz1GreaterThanText)
        expect(pageContent.siteDrawnSize).toEqual(siteDrawnSizeText)
        expect(pageContent.fraTitle).toEqual(fraTitleText)
        expect(pageContent.rsSummaryTitle).toEqual(rsSummaryTitleText)
        expect(pageContent.orderP4Button).toEqual(orderP4ButtonText)
        expect(pageContent.fz1FRAOnlyNeededWhen).toEqual(false)
        expect(pageContent.siteDrawnIsLessThan).toEqual(false)
        expect(pageContent.swSummaryTitle).toEqual(false)
        expect(pageContent.riversBulletPoint).toEqual(false)
        expect(pageContent.adminUpdatedData).toEqual(false)
      })

      it('should show RS title and tidal bullet point, zone 1 relevant text (FRA required) when <1ha drawn with climate change zone', async () => {
        getPsoContactsByPolygon.mockResolvedValue({
          isEngland: true,
          EmailAddress: 'emdenquiries@environment-agency.gov.uk',
          AreaName: 'East Midlands',
          useAutomatedService: true,
          LocalAuthorities: 'Derbyshire Dales'
        })
        getFloodDataByPolygon.mockResolvedValue({
          floodzone_2: false,
          floodzone_3: false,
          floodZone: '1',
          floodZoneLevel: 'low',
          floodZoneClimateChange: true,
          floodZoneClimateChangeNoData: false,
          surfaceWater: {
            riskBandId: -1,
            riskBand: false,
            riskBandPercent: null,
            riskBandOdds: null
          },
          hasSeaSource: true,
          hasRiversSource: false,
          floodSource: 'the sea',
          isRiskAdminArea: false
        })
        getAreaInHectaresSpy.mockReturnValue(0)
        const response = await submitGetRequest({ url: `${url}?${getUniquePolygonQuery()}` })
        const pageContent = getElementByIdAndFormat(response.payload)
        expect(pageContent.heading).toEqual(getHeadingAndMeaningText(1).heading)
        expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(1).meaning)
        expect(pageContent.seaBulletPoint).toEqual(seaBulletPointText)
        expect(pageContent.fraTitle).toEqual(fraTitleText)
        expect(pageContent.rsSummaryTitle).toEqual(rsSummaryTitleText)
        expect(pageContent.fzProbability).toEqual(getFZProbabilityText(1, 'low'))
        expect(pageContent.fz1DataUnlikely).toEqual(fz1DataUnlikelyText)
        expect(pageContent.orderP4Button).toEqual(orderP4ButtonText)
        expect(pageContent.siteDrawnIsLessThanCC).toEqual(siteDrawnIsLessThanCCText)
        expect(pageContent.fraRequired).toEqual(fraRequiredText)
        expect(pageContent.riskWhenCC).toEqual(getCCSumaryText('the sea'))
        expect(pageContent.p4FZ1UnlikleyData).toEqual(false)
        expect(pageContent.fz1FRAOnlyNeededWhen).toEqual(false)
        expect(pageContent.adminUpdatedData).toEqual(false)
        expect(pageContent.swSummaryTitle).toEqual(false)
        expect(pageContent.unavailableCCData).toEqual(false)
      })

      it('should not show RS title and bullet point, zone 1 relevant text (FRA required) when <1ha drawn with no data zone', async () => {
        getPsoContactsByPolygon.mockResolvedValue({
          isEngland: true,
          EmailAddress: 'emdenquiries@environment-agency.gov.uk',
          AreaName: 'East Midlands',
          useAutomatedService: true,
          LocalAuthorities: 'Derbyshire Dales'
        })
        getFloodDataByPolygon.mockResolvedValue({
          floodzone_2: false,
          floodzone_3: false,
          floodZone: '1',
          floodZoneLevel: 'low',
          floodZoneClimateChange: true,
          floodZoneClimateChangeNoData: true,
          surfaceWater: {
            riskBandId: -1,
            riskBand: false,
            riskBandPercent: null,
            riskBandOdds: null
          },
          isRiskAdminArea: false,
          hasSeaSource: true,
          hasRiversSource: true,
          floodSource: 'rivers and the sea'
        })
        getAreaInHectaresSpy.mockReturnValue(0)
        const response = await submitGetRequest({ url: `${url}?${getUniquePolygonQuery()}` })
        const pageContent = getElementByIdAndFormat(response.payload)
        expect(pageContent.heading).toEqual(getHeadingAndMeaningText(1).heading)
        expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(1).meaning)
        expect(pageContent.fraTitle).toEqual(fraTitleText)
        expect(pageContent.rsSummaryTitle).toEqual(rsSummaryTitleText)
        expect(pageContent.fzProbability).toEqual(getFZProbabilityText(1, 'low'))
        expect(pageContent.siteDrawnIsLessThanCC).toEqual(siteDrawnIsLessThanCCText)
        expect(pageContent.orderP4Button).toEqual(orderP4ButtonText)
        expect(pageContent.unavailableCCData).toEqual(unavailableCCDataText)
        expect(pageContent.riversAndSeaBulletPoint).toEqual(riversAndSeaBulletPointText)
        expect(pageContent.seaBulletPoint).toEqual(false)
        expect(pageContent.riskWhenCC).toEqual(getCCSumaryText('rivers and the sea'))
        expect(pageContent.fraRequired).toEqual(fraRequiredText)
        expect(pageContent.fz1FRAOnlyNeededWhen).toEqual(false)
        expect(pageContent.adminUpdatedData).toEqual(false)
        expect(pageContent.siteDrawnSize).toEqual(false)
      })

      it('should rivers and sea climate change bullet point when no data climate change zone only', async () => {
        getPsoContactsByPolygon.mockResolvedValue({
          isEngland: true,
          EmailAddress: 'emdenquiries@environment-agency.gov.uk',
          AreaName: 'East Midlands',
          useAutomatedService: true,
          LocalAuthorities: 'Derbyshire Dales'
        })
        getFloodDataByPolygon.mockResolvedValue({
          floodzone_2: false,
          floodzone_3: false,
          floodZone: '1',
          floodZoneLevel: 'low',
          floodZoneClimateChange: true,
          floodZoneClimateChangeNoData: true,
          surfaceWater: {
            riskBandId: -1,
            riskBand: false,
            riskBandPercent: null,
            riskBandOdds: null
          },
          isRiskAdminArea: false,
          hasSeaSource: false,
          hasRiversSource: false,
          floodSource: 'Unavailable'
        })
        getAreaInHectaresSpy.mockReturnValue(0)
        const response = await submitGetRequest({ url: `${url}?${getUniquePolygonQuery()}` })
        const pageContent = getElementByIdAndFormat(response.payload)
        expect(pageContent.riversAndSeaCCNoDataBulletPoint).toEqual(riversAndSeaCCNoDataBulletPointText)
      })

      it('should show RS title and bullet point, zone 1 relevant text (no FRA) when admin console updated area', async () => {
        getPsoContactsByPolygon.mockResolvedValue({
          isEngland: true,
          EmailAddress: 'emdenquiries@environment-agency.gov.uk',
          AreaName: 'East Midlands',
          useAutomatedService: true,
          LocalAuthorities: 'Derbyshire Dales'
        })
        getFloodDataByPolygon.mockResolvedValue({
          floodzone_2: false,
          floodzone_3: false,
          floodZone: '1',
          floodZoneLevel: 'low',
          floodZoneClimateChange: false,
          floodZoneClimateChangeNoData: false,
          surfaceWater: {
            riskBandId: -1,
            riskBand: false,
            riskBandPercent: null,
            riskBandOdds: null
          },
          isRiskAdminArea: true,
          hasSeaSource: true,
          hasRiversSource: true,
          floodSource: 'rivers and the sea'
        })
        const response = await submitGetRequest({ url: `${url}?${getUniquePolygonQuery()}` })
        const pageContent = getElementByIdAndFormat(response.payload)
        expect(pageContent.heading).toEqual(getHeadingAndMeaningText(1).heading)
        expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(1).meaning)
        expect(pageContent.adminUpdatedData).toEqual(adminUpdatedDataText)
        expect(pageContent.riskWhenCC).toEqual(false)
        expect(pageContent.orderP4Button).toEqual(orderP4ButtonText)
        expect(pageContent.riversBulletPoint).toEqual(false)
        expect(pageContent.fz23FRA).toEqual(false)
      })
    })

    describe('Flood zone 2', () => {
      it('should show RS title and bullet point, zone 2 low risk, 1 in 1000 SW text (FRA required)', async () => {
        getPsoContactsByPolygon.mockResolvedValue({
          isEngland: true,
          EmailAddress: 'emdenquiries@environment-agency.gov.uk',
          AreaName: 'East Midlands',
          useAutomatedService: true,
          LocalAuthorities: 'Derbyshire Dales'
        })
        getFloodDataByPolygon.mockResolvedValue({
          floodzone_2: false,
          floodzone_3: true,
          floodZone: '2',
          floodZoneLevel: 'medium',
          floodZoneClimateChange: false,
          floodZoneClimateChangeNoData: false,
          surfaceWater: {
            riskBandId: 3,
            riskBand: 'High',
            riskBandPercent: '0.1',
            riskBandOdds: '1 in 1000'
          },
          isRiskAdminArea: false,
          hasSeaSource: false,
          hasRiversSource: true,
          floodSource: 'rivers'
        })
        const response = await submitGetRequest({ url: `${url}?${getUniquePolygonQuery()}` })
        const pageContent = getElementByIdAndFormat(response.payload)
        expect(pageContent.heading).toEqual(getHeadingAndMeaningText(2).heading)
        expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(2).meaning)
        expect(pageContent.riversBulletPoint).toEqual(riversBulletPointText)
        expect(pageContent.seaBulletPoint).toEqual(false)
        expect(pageContent.fraTitle).toEqual(fraTitleText)
        expect(pageContent.rsSummaryTitle).toEqual(rsSummaryTitleText)
        expect(pageContent.fraRequired).toEqual(fraRequiredText)
        expect(pageContent.fzProbability).toEqual(getFZProbabilityText(2, 'medium'))
        expect(pageContent.swSummaryTitle).toEqual(getSWInfoText().swSummaryTitleText)
        expect(pageContent.swSummaryKeyCC).toEqual(getSWInfoText().swSummaryKeyCCText)
        expect(pageContent.swProbability).toEqual(getSWInfoText('0.1', '1 in 1000').swProbabilityText)
        expect(pageContent.orderP4Button).toEqual(orderP4ButtonText)
        expect(pageContent.fz1DataUnlikely).toEqual(false)
        expect(pageContent.adminUpdatedData).toEqual(false)
        expect(pageContent.siteDrawnIsLessThan).toEqual(false)
        expect(pageContent.fz1FRAOnlyNeededWhen).toEqual(false)
        expect(pageContent.siteDrawnIsLessThanCC).toEqual(false)
      })

      it('should show RS title and rivers and sea bullet points, zone 2 low risk, 1 in 100 SW text (FRA required)', async () => {
        getPsoContactsByPolygon.mockResolvedValue({
          isEngland: true,
          EmailAddress: 'emdenquiries@environment-agency.gov.uk',
          AreaName: 'East Midlands',
          useAutomatedService: true,
          LocalAuthorities: 'Derbyshire Dales'
        })
        getFloodDataByPolygon.mockResolvedValue({
          floodzone_2: false,
          floodzone_3: true,
          floodZone: '2',
          floodZoneLevel: 'medium',
          floodZoneClimateChange: false,
          floodZoneClimateChangeNoData: false,
          surfaceWater: {
            riskBandId: 3,
            riskBand: 'High',
            riskBandPercent: '1',
            riskBandOdds: '1 in 100'
          },
          isRiskAdminArea: false,
          hasSeaSource: true,
          hasRiversSource: true,
          floodSource: 'rivers'
        })
        const response = await submitGetRequest({ url: `${url}?${getUniquePolygonQuery()}` })
        const pageContent = getElementByIdAndFormat(response.payload)
        expect(pageContent.heading).toEqual(getHeadingAndMeaningText(2).heading)
        expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(2).meaning)
        expect(pageContent.riversAndSeaBulletPoint).toEqual(riversAndSeaBulletPointText)
        expect(pageContent.riversBulletPoint).toEqual(false)
        expect(pageContent.seaBulletPoint).toEqual(false)
        expect(pageContent.fraTitle).toEqual(fraTitleText)
        expect(pageContent.rsSummaryTitle).toEqual(rsSummaryTitleText)
        expect(pageContent.fraRequired).toEqual(fraRequiredText)
        expect(pageContent.fzProbability).toEqual(getFZProbabilityText(2, 'medium'))
        expect(pageContent.swSummaryTitle).toEqual(getSWInfoText().swSummaryTitleText)
        expect(pageContent.swSummaryKeyCC).toEqual(getSWInfoText().swSummaryKeyCCText)
        expect(pageContent.swProbability).toEqual(getSWInfoText('1', '1 in 100').swProbabilityText)
        expect(pageContent.orderP4Button).toEqual(orderP4ButtonText)
        expect(pageContent.fz23FRA).toEqual(fz23FRAText)
        expect(pageContent.adminUpdatedData).toEqual(false)
        expect(pageContent.siteDrawnIsLessThan).toEqual(false)
      })
    })

    describe('Flood zone 3', () => {
      it('Should have correct copy for Zone 3 high risk', async () => {
        getPsoContactsByPolygon.mockResolvedValue({
          isEngland: true,
          EmailAddress: 'emdenquiries@environment-agency.gov.uk',
          AreaName: 'East Midlands',
          useAutomatedService: true,
          LocalAuthorities: 'Derbyshire Dales'
        })
        getFloodDataByPolygon.mockResolvedValue({
          floodzone_2: false,
          floodzone_3: true,
          floodZone: '3',
          floodZoneLevel: 'high',
          floodZoneClimateChange: false,
          floodZoneClimateChangeNoData: false,
          surfaceWater: {
            riskBandId: 3,
            riskBand: 'High',
            riskBandPercent: '3.3',
            riskBandOdds: '1 in 30'
          },
          isRiskAdminArea: false,
          hasSeaSource: false,
          hasRiversSource: true,
          floodSource: 'rivers'
        })
        const response = await submitGetRequest({ url: `${url}?${getUniquePolygonQuery()}` })
        const pageContent = getElementByIdAndFormat(response.payload)
        expect(pageContent.heading).toEqual(getHeadingAndMeaningText(3).heading)
        expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(3).meaning)
        expect(pageContent.riversBulletPoint).toEqual(riversBulletPointText)
        expect(pageContent.seaBulletPoint).toEqual(false)
        expect(pageContent.fraTitle).toEqual(fraTitleText)
        expect(pageContent.fraRequired).toEqual(fraRequiredText)
        expect(pageContent.fzProbability).toEqual(getFZProbabilityText(3, 'high'))
        expect(pageContent.swSummaryTitle).toEqual(getSWInfoText().swSummaryTitleText)
        expect(pageContent.swSummaryKeyCC).toEqual(getSWInfoText().swSummaryKeyCCText)
        expect(pageContent.orderP4Button).toEqual(orderP4ButtonText)
        expect(pageContent.fz23FRA).toEqual(fz23FRAText)
        expect(pageContent.adminUpdatedData).toEqual(false)
        expect(pageContent.siteDrawnIsLessThan).toEqual(false)
      })

      it('Should include boundary to big text if boundary is over 300ha', async () => {
        getPsoContactsByPolygon.mockResolvedValue({
          isEngland: true,
          EmailAddress: 'emdenquiries@environment-agency.gov.uk',
          AreaName: 'East Midlands',
          useAutomatedService: true,
          LocalAuthorities: 'Derbyshire Dales'
        })
        getFloodDataByPolygon.mockResolvedValue({
          floodzone_2: false,
          floodzone_3: true,
          floodZone: '3',
          floodZoneLevel: 'high',
          floodZoneClimateChange: false,
          floodZoneClimateChangeNoData: false,
          surfaceWater: {
            riskBandId: 3,
            riskBand: 'High',
            riskBandPercent: '3.3',
            riskBandOdds: '1 in 30'
          },
          isRiskAdminArea: false,
          hasSeaSource: true,
          hasRiversSource: false,
          floodSource: 'sea'
        })
        getAreaInHectaresSpy.mockReturnValue(350)
        const response = await submitGetRequest({ url: `${url}?${getUniquePolygonQuery()}` })
        const pageContent = getElementByIdAndFormat(response.payload)
        expect(pageContent.heading).toEqual(getHeadingAndMeaningText(3).heading)
        expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(3).meaning)
        expect(pageContent.riversBulletPoint).toEqual(false)
        expect(pageContent.seaBulletPoint).toEqual(seaBulletPointText)
        expect(pageContent.fraTitle).toEqual(fraTitleText)
        expect(pageContent.fraRequired).toEqual(fraRequiredText)
        expect(pageContent.fzProbability).toEqual(getFZProbabilityText(3, 'high'))
        expect(pageContent.boundaryTooBig).toEqual(getSWInfoText().boundaryTooBigText)
        expect(pageContent.swSummaryTitle).toEqual(getSWInfoText().swSummaryTitleText)
        expect(pageContent.swSummaryKeyCC).toEqual(getSWInfoText().swSummaryKeyCCText)
        expect(pageContent.adminUpdatedData).toEqual(false)
        expect(pageContent.siteDrawnIsLessThan).toEqual(false)
      })
    })

    describe('opted out area', () => {
      it('should not show the "Order flood risk data" for opted out areas', async () => {
        getPsoContactsByPolygon.mockResolvedValue({
          isEngland: true,
          EmailAddress: 'emdenquiries@environment-agency.gov.uk',
          AreaName: 'East Midlands',
          useAutomatedService: false,
          LocalAuthorities: 'Derbyshire Dales'
        })
        getFloodDataByPolygon.mockResolvedValue({
          floodzone_2: false,
          floodzone_3: true,
          floodZone: '3',
          floodZoneLevel: 'high',
          floodZoneClimateChange: false,
          floodZoneClimateChangeNoData: false,
          surfaceWater: {
            riskBandId: 3,
            riskBand: 'High',
            riskBandPercent: '3.3',
            riskBandOdds: '1 in 30'
          },
          isRiskAdminArea: false,
          hasSeaSource: false,
          hasRiversSource: true,
          floodSource: 'rivers'
        })
        const response = await submitGetRequest({ url: `${url}?${getUniquePolygonQuery()}` })
        const pageContent = getElementByIdAndFormat(response.payload)
        expect(pageContent.heading).toEqual(getHeadingAndMeaningText(3).heading)
        expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(3).meaning)
        expect(pageContent.riversBulletPoint).toEqual(riversBulletPointText)
        expect(pageContent.seaBulletPoint).toEqual(false)
        expect(pageContent.p4EmailIn20Days).toEqual(p4EmailIn20DaysText)
        expect(pageContent.orderP4Button).toEqual(false)
        expect(pageContent.adminUpdatedData).toEqual(false)
        expect(pageContent.p4FZ1UnlikleyData).toEqual(false)
      })

      it('should not show the "Order flood risk data" for opted out areas in FZ1', async () => {
        getPsoContactsByPolygon.mockResolvedValue({
          isEngland: true,
          EmailAddress: 'emdenquiries@environment-agency.gov.uk',
          AreaName: 'East Midlands',
          useAutomatedService: false,
          LocalAuthorities: 'Derbyshire Dales'
        })
        getFloodDataByPolygon.mockResolvedValue({
          floodzone_2: false,
          floodzone_3: true,
          floodZone: '1',
          floodZoneLevel: 'low',
          floodZoneClimateChange: false,
          floodZoneClimateChangeNoData: false,
          surfaceWater: {
            riskBandId: 3,
            riskBand: 'High',
            riskBandPercent: '3.3',
            riskBandOdds: '1 in 30'
          },
          isRiskAdminArea: false,
          hasSeaSource: false,
          hasRiversSource: false,
          floodSource: null
        })
        const response = await submitGetRequest({ url: `${url}?${getUniquePolygonQuery()}` })
        const pageContent = getElementByIdAndFormat(response.payload)
        expect(pageContent.heading).toEqual(getHeadingAndMeaningText(1).heading)
        expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(1).meaning)
        expect(pageContent.p4FZ1UnlikleyData).toEqual(p4FZ1UnlikleyDataText)
        expect(pageContent.riversBulletPoint).toEqual(false)
        expect(pageContent.orderP4Button).toEqual(false)
        expect(pageContent.p4EmailIn20Days).toEqual(false)
        expect(pageContent.adminUpdatedData).toEqual(false)
      })
    })

    it('Should still show the opted out text if boundary is over 300ha', async () => {
      getPsoContactsByPolygon.mockResolvedValue({
        isEngland: true,
        EmailAddress: 'emdenquiries@environment-agency.gov.uk',
        AreaName: 'East Midlands',
        useAutomatedService: false,
        LocalAuthorities: 'Derbyshire Dales'
      })
      getFloodDataByPolygon.mockResolvedValue({
        floodzone_2: false,
        floodzone_3: true,
        floodZone: '3',
        floodZoneLevel: 'high',
        floodZoneClimateChange: false,
        floodZoneClimateChangeNoData: false,
        surfaceWater: {
          riskBandId: 3,
          riskBand: 'High',
          riskBandPercent: '3.3',
          riskBandOdds: '1 in 30'
        },
        isRiskAdminArea: false,
        hasSeaSource: false,
        hasRiversSource: true,
        floodSource: 'rivers'
      })
      getAreaInHectaresSpy.mockReturnValue(350)
      const response = await submitGetRequest({ url: `${url}?${getUniquePolygonQuery()}` })
      const pageContent = getElementByIdAndFormat(response.payload)
      expect(pageContent.heading).toEqual(getHeadingAndMeaningText(3).heading)
      expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(3).meaning)
      expect(pageContent.riversBulletPoint).toEqual(riversBulletPointText)
      expect(pageContent.seaBulletPoint).toEqual(false)
      expect(pageContent.fraTitle).toEqual(fraTitleText)
      expect(pageContent.fraRequired).toEqual(fraRequiredText)
      expect(pageContent.fzProbability).toEqual(getFZProbabilityText(3, 'high'))
      expect(pageContent.boundaryTooBig).toEqual(false)
      expect(pageContent.orderP4Button).toEqual(false)
      expect(pageContent.swSummaryTitle).toEqual(getSWInfoText().swSummaryTitleText)
      expect(pageContent.swSummaryKeyCC).toEqual(getSWInfoText().swSummaryKeyCCText)
      expect(pageContent.adminUpdatedData).toEqual(false)
      expect(pageContent.siteDrawnIsLessThan).toEqual(false)
    })
  })

  describe('On Internal', () => {
    beforeAll(() => { config.appType = 'internal' })
    beforeEach(() => { getProductOnePause.mockReturnValueOnce({ payload: { pauseP1DownloadFrom: null, pauseP1DownloadTo: null } }) })
    it('should show the "Order flood risk data" for opted out areas on internal', async () => {
      getPsoContactsByPolygon.mockResolvedValue({
        isEngland: true,
        EmailAddress: 'emdenquiries@environment-agency.gov.uk',
        AreaName: 'East Midlands',
        useAutomatedService: false,
        LocalAuthorities: 'Derbyshire Dales'
      })
      getFloodDataByPolygon.mockResolvedValue({
        floodzone_2: false,
        floodzone_3: true,
        floodZone: '3',
        floodZoneLevel: 'low',
        floodZoneClimateChange: false,
        floodZoneClimateChangeNoData: false,
        surfaceWater: {
          riskBandId: 3,
          riskBand: 'High',
          riskBandPercent: '3.3',
          riskBandOdds: '1 in 30'
        },
        isRiskAdminArea: false,
        hasSeaSource: false,
        hasRiversSource: true,
        floodSource: 'rivers'
      })
      const response = await submitGetRequest({ url: `${url}?${getUniquePolygonQuery()}` })
      const pageContent = getElementByIdAndFormat(response.payload)
      expect(pageContent.heading).toEqual(getHeadingAndMeaningText(3).heading)
      expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(3).meaning)
      expect(pageContent.adminUpdatedData).toEqual(false)
      expect(pageContent.orderP4Button).toEqual(orderP4ButtonText)
    })
  })
})

// Reused constants
const floodZones = { 1: '1', 2: '2', 3: '3' }
const getHeadingAndMeaningText = (floodZone) => {
  return {
    heading: `This location is in flood zone ${floodZones[floodZone]}`,
    meaning: `What flood zone ${floodZones[floodZone]} means`
  }
}
const getCCSumaryText = (floodSource) => {
  return `This location is at risk from flooding from ${floodSource} when climate change is taken into account:`
}
const getFZProbabilityText = (floodZone, riskValue) => {
  return `Land within flood zone ${floodZones[floodZone]} has a ${riskValue} probability of flooding from rivers and the sea.`
}
const getSWInfoText = (riskBandPercent, riskBandOdds) => {
  const swContent = {
    swSummaryTitleText: 'Surface water for planning',
    swSummaryKeyCCText: 'Climate change: projected chance of flooding',
    boundaryTooBigText: 'The boundary is too big to order detailed flood risk information (product 4). Reduce the boundary size to under 300 hectares.',
    swProbabilityText: `The chance of surface water flooding at this location could be more than ${riskBandPercent}% (${riskBandOdds}) each year.`
  }

  return swContent
}
const riversBulletPointText = 'rivers (fluvial)'
const seaBulletPointText = 'the sea (tidal)'
const riversAndSeaBulletPointText = 'rivers and the sea (fluvial and tidal)'
const swBulletPointText = 'surface water'
const riversAndSeaCCNoDataBulletPointText = 'rivers and the sea (fluvial or tidal) due to climate change'
const fz1DataUnlikelyText = 'Your site is in flood zone 1, so it\'s unlikely we\'ll have any flood risk data for it. You can place an order and we\'ll email you if none is available.'
const rsSummaryTitleText = 'Rivers and the sea'
const orderP4ButtonText = 'Order flood risk data'
const fz1FRAOnlyNeededWhenText = 'Developments in flood zone 1 that are less than 1 hectare (ha) only need a flood risk assessment (FRA) where:'
const siteDrawnIsLessThanText = 'The site you have drawn is less than 0.01ha.'
const siteDrawnSizeText = 'The site you have drawn is 123.43ha.'
const fz1GreaterThanText = 'Developments in flood zone 1 that are more than 1 hectare need a flood risk assessment (FRA).'
const fraRequiredText = 'Based on our flood risk data, you need to carry out a flood risk assessment (FRA) as part of the planning application for this development.'
const fz23FRAText = 'You need to carry out a flood risk assessment (FRA) as part of the planning application for this development.'
const fraTitleText = 'Flood risk assessments'
const adminUpdatedDataText = 'Our understanding of flood risk from rivers and the sea has changed since this information was published.'
const riskFloodingFromText = 'In your proposed development site there is a risk of flooding from:'
const siteDrawnIsLessThanCCText = 'The site you have drawn is less than 0.01ha.'
const unavailableCCDataText = 'Climate change data unavailable'
const p4FZ1UnlikleyDataText = "Your site is in flood zone 1, so it is unlikely we'll have any flood risk data for it. You can place an order and we will email you if none are available."
const p4EmailIn20DaysText = 'We aim to email you the data within 20 working days.'

// Function uses regex tpo remove gaps in HTML payload.
const removeHtmlGaps = (text) => {
  return text.replace(/\s\s+/g, ' ').trim()
}

// Function that gets an element and formats using removeHtmlGaps.
// If not element is found in a scenario it returns false (ie. element should not be on page).
const getElementByIdAndFormat = (payload) => {
  document.body.innerHTML = payload
  const heading = document.getElementById('heading').textContent ? document.getElementById('heading').textContent : false
  const fzMeaningDescription = removeHtmlGaps(document.getElementById('fzMeaningDescription').textContent)
  const riversAndSeaBulletPoint = document.getElementById('riversAndSeaBulletPoint') ? removeHtmlGaps(document.getElementById('riversAndSeaBulletPoint').textContent) : false
  const riversBulletPoint = document.getElementById('riversBulletPoint') ? removeHtmlGaps(document.getElementById('riversBulletPoint').textContent) : false
  const seaBulletPoint = document.getElementById('seaBulletPoint') ? removeHtmlGaps(document.getElementById('seaBulletPoint').textContent) : false
  const riversAndSeaCCNoDataBulletPoint = document.getElementById('riversAndSeaNoDataBulletPoint') ? removeHtmlGaps(document.getElementById('riversAndSeaNoDataBulletPoint').textContent) : false
  const fz1DataUnlikely = document.getElementById('fz1DataUnlikely') ? removeHtmlGaps(document.getElementById('fz1DataUnlikely').textContent) : false
  const rsSummaryTitle = removeHtmlGaps(document.getElementById('rsSummaryTitle').textContent)
  const orderP4Button = document.getElementById('orderP4Button') ? removeHtmlGaps(document.getElementById('orderP4Button').textContent) : false
  const fraRequired = document.getElementById('fraRequired') ? removeHtmlGaps(document.getElementById('fraRequired').textContent) : false
  const fzProbability = document.getElementById('fzProbability') ? removeHtmlGaps(document.getElementById('fzProbability').textContent) : false
  const fz1FRAOnlyNeededWhen = document.getElementById('fz1FRAOnlyNeededWhen') ? removeHtmlGaps(document.getElementById('fz1FRAOnlyNeededWhen').textContent) : false
  const fz23FRA = document.getElementById('fz23FRA') ? removeHtmlGaps(document.getElementById('fz23FRA').textContent) : false
  const siteDrawnIsLessThan = document.getElementById('siteDrawnIsLessThan') ? removeHtmlGaps(document.getElementById('siteDrawnIsLessThan').textContent) : false
  const siteDrawnIsLessThanCC = document.getElementById('siteDrawnIsLessThanCC') ? removeHtmlGaps(document.getElementById('siteDrawnIsLessThanCC').textContent) : false
  const fz1GreaterThan = document.getElementById('fz1GreaterThan') ? removeHtmlGaps(document.getElementById('fz1GreaterThan').textContent) : false
  const siteDrawnSize = document.getElementById('siteDrawnSize') ? removeHtmlGaps(document.getElementById('siteDrawnSize').textContent) : false
  const fraTitle = document.getElementById('fraTitle') ? removeHtmlGaps(document.getElementById('fraTitle').textContent) : false
  const adminUpdatedData = document.getElementById('adminUpdatedData') ? removeHtmlGaps(document.getElementById('adminUpdatedData').textContent) : false
  const swSummaryTitle = document.getElementById('swSummaryTitle') ? removeHtmlGaps(document.getElementById('swSummaryTitle').textContent) : false
  const swBulletPoint = document.getElementById('swBulletPoint') ? removeHtmlGaps(document.getElementById('swBulletPoint').textContent) : false
  const swSummaryKeyCC = document.getElementById('swSummaryKeyCC') ? removeHtmlGaps(document.getElementById('swSummaryKeyCC').textContent) : false
  const boundaryTooBig = document.getElementById('boundaryTooBig') ? removeHtmlGaps(document.getElementById('boundaryTooBig').textContent) : false
  const swProbability = document.getElementById('swProbability') ? removeHtmlGaps(document.getElementById('swProbability').textContent) : false
  const riskFloodingFrom = document.getElementById('riskFloodingFrom') ? removeHtmlGaps(document.getElementById('riskFloodingFrom').textContent) : false
  const riskWhenCC = document.getElementById('riskWhenCC') ? removeHtmlGaps(document.getElementById('riskWhenCC').textContent) : false
  const unavailableCCData = document.getElementById('unavailableCCData') ? removeHtmlGaps(document.getElementById('unavailableCCData').textContent) : false
  const p4FZ1UnlikleyData = document.getElementById('p4FZ1UnlikleyData') ? removeHtmlGaps(document.getElementById('p4FZ1UnlikleyData').textContent) : false
  const p4EmailIn20Days = document.getElementById('p4EmailIn20Days') ? removeHtmlGaps(document.getElementById('p4EmailIn20Days').textContent) : false

  return {
    heading,
    fzMeaningDescription,
    riversAndSeaBulletPoint,
    riversBulletPoint,
    seaBulletPoint,
    swBulletPoint,
    riversAndSeaCCNoDataBulletPoint,
    fz1DataUnlikely,
    rsSummaryTitle,
    orderP4Button,
    fraRequired,
    fzProbability,
    fz1FRAOnlyNeededWhen,
    siteDrawnIsLessThan,
    siteDrawnIsLessThanCC,
    fz1GreaterThan,
    siteDrawnSize,
    fraTitle,
    swSummaryTitle,
    adminUpdatedData,
    swSummaryKeyCC,
    boundaryTooBig,
    swProbability,
    fz23FRA,
    riskFloodingFrom,
    riskWhenCC,
    unavailableCCData,
    p4FZ1UnlikleyData,
    p4EmailIn20Days
  }
}
