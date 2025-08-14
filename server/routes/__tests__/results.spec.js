const { submitGetRequest } = require('../../__test-helpers__/server')
const { mockPolygons } = require('../../services/__tests__/__mocks__/floodDataByPolygonMock')
const { config } = require('../../../config')
jest.mock('../../services/agol/getContacts')

/*
This test file is used to check the dynamic content on the results page html.
It is useful as we need to test the nunjuck logic.
*/

const url = '/results'
const floodZones = { 1: '1', 2: '2', 3: '3' }
const getHeadingAndMeaningText = (floodZone) => {
  return {
    heading: `This location is in flood zone ${floodZones[floodZone]}`,
    meaning: `What flood zone ${floodZones[floodZone]} means`
  }
}
const getFZProbabilityText = (floodZone, riskValue) => {
  return `Land within flood zone ${floodZones[floodZone]} has a ${riskValue} probability of flooding from rivers and the sea.`
}
const getSWInfoText = (riskBandPercent, riskBandOdds) => {
  const swContent = {
    swSummaryTitleText: 'Surface water for planning',
    swSummaryKeyCCText: 'Climate change: projected chance of flooding',
    swDoNotShowCCText: 'We do not currently show climate change scenarios for surface water.',
    swProbabilityText: `The chance of surface water flooding at this location could be more than ${riskBandPercent}% (${riskBandOdds}) each year.`
  }

  return swContent
}
const rsBulletPointText = 'rivers and the sea'
const swBulletPointText = 'surface water'
const fz1DataUnlikelyText = 'Your site is in flood zone 1, so it\'s unlikely we\'ll have any flood risk data for it. You can place an order and we\'ll email you if none is available.'
const rsSummaryTitleText = 'Rivers and the sea'
const orderP4ButtonText = 'Order flood risk data'
const fz1FRAOnlyNeededWhenText = 'Developments in flood zone 1 that are less than 1 hectare (ha) only need a flood risk assessment (FRA) where:'
const siteDrawnIsLessThanText = 'The site you have drawn is less than 0.01ha.'
const siteDrawnSizeText = 'The site you have drawn is 123.43ha.'
const fz1GreaterThanText = 'Developments in flood zone 1 that are more than 1 hectare need a flood risk assessment (FRA).'
const fraRequiredText = 'Based on our flood risk data, you need to carry out a flood risk assessment (FRA) as part of the planning application for this development.'
const fraTitleText = 'Flood risk assessments'
const adminUpdatedDataText = 'Our understanding of flood risk from rivers and the sea has changed since this information was published.'

describe('Results Page On Public', () => {
  beforeAll(() => { config.appType = 'public' })
  afterAll(() => { config.appType = 'internal' })

  describe('Flood zone 1', () => {
    it('should show FZ1 title and RS bullet point, zone 1 relevant text (no FRA) when <1ha drawn', async () => {
      const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz1_only}` })
      const pageContent = getFZ1DynamicContent(response.payload)

      expect(pageContent.heading).toEqual(getHeadingAndMeaningText(1).heading)
      expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(1).meaning)
      expect(pageContent.rsBulletPoint).toEqual(rsBulletPointText)
      expect(pageContent.fz1DataUnlikely).toEqual(fz1DataUnlikelyText)
      expect(pageContent.fzProbability).toEqual(getFZProbabilityText(1, 'low'))
      expect(pageContent.rsSummaryTitle).toEqual(rsSummaryTitleText)
      expect(pageContent.orderP4Button).toEqual(orderP4ButtonText)
      expect(pageContent.fraRequired).toEqual(false)
    })

    it('should show FZ1 title, zone 1 relevant text (no FRA) when <1ha drawn with Surface Water bullet point', async () => {
      const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz1_only_lt_1_ha_sw}` })
      const pageContent = getFZ1DynamicContent(response.payload)
      expect(pageContent.heading).toEqual(getHeadingAndMeaningText(1).heading)
      expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(1).meaning)
      expect(pageContent.rsBulletPoint).toEqual(false)
      expect(pageContent.swBulletPoint).toEqual(swBulletPointText)
      expect(pageContent.fz1DataUnlikely).toEqual(fz1DataUnlikelyText)
      expect(pageContent.rsSummaryTitle).toEqual(rsSummaryTitleText)
      expect(pageContent.orderP4Button).toEqual(orderP4ButtonText)
    })

    it('should show RS title and bullet point, zone 1 relevant text (FRA required) when >1ha drawn', async () => {
      const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz1_only_gt_1_ha}` })
      const pageContent = getFZ1DynamicContent(response.payload)
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
      expect(pageContent.rsBulletPoint).toEqual(false)
      expect(pageContent.adminUpdatedData).toEqual(false)
    })

    it('should show RS title and bullet point, zone 1 relevant text (FRA required) when <1ha drawn with climate change zone', async () => {
      const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz1_only}` })
      const pageContent = getFZ1DynamicContent(response.payload)
      expect(pageContent.heading).toEqual(getHeadingAndMeaningText(1).heading)
      expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(1).meaning)
      expect(pageContent.rsBulletPoint).toEqual(rsBulletPointText)
      expect(pageContent.fraTitle).toEqual(fraTitleText)
      expect(pageContent.rsSummaryTitle).toEqual(rsSummaryTitleText)
      expect(pageContent.fzProbability).toEqual(getFZProbabilityText(1, 'low'))
      expect(pageContent.fz1DataUnlikely).toEqual(fz1DataUnlikelyText)
      expect(pageContent.fz1FRAOnlyNeededWhen).toEqual(fz1FRAOnlyNeededWhenText)
      expect(pageContent.siteDrawnIsLessThan).toEqual(siteDrawnIsLessThanText)
      expect(pageContent.orderP4Button).toEqual(orderP4ButtonText)
      expect(pageContent.adminUpdatedData).toEqual(false)
      expect(pageContent.swSummaryTitle).toEqual(false)
      expect(pageContent.fraRequired).toEqual(false)
    })

    it('should show RS title and bullet point, zone 1 relevant text (FRA required) when <1ha drawn with no data zone', async () => {
      const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz1_only_no_la}` })
      const pageContent = getFZ1DynamicContent(response.payload)
      expect(pageContent.heading).toEqual(getHeadingAndMeaningText(1).heading)
      expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(1).meaning)
      expect(pageContent.rsBulletPoint).toEqual(rsBulletPointText)
      expect(pageContent.fraTitle).toEqual(fraTitleText)
      expect(pageContent.rsSummaryTitle).toEqual(rsSummaryTitleText)
      expect(pageContent.fzProbability).toEqual(getFZProbabilityText(1, 'low'))
      expect(pageContent.fz1FRAOnlyNeededWhen).toEqual(fz1FRAOnlyNeededWhenText)
      expect(pageContent.siteDrawnIsLessThan).toEqual(siteDrawnIsLessThanText)
      expect(pageContent.orderP4Button).toEqual(orderP4ButtonText)
      expect(pageContent.siteDrawnSize).toEqual(false)
      expect(pageContent.fraRequired).toEqual(false)
      expect(pageContent.adminUpdatedData).toEqual(false)
    })

    it('should show RS title and bullet point, zone 1 relevant text (no FRA) when admin console updated area', async () => {
      const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.inRiskAdmin.fz1_only}` })
      const pageContent = getFZ1DynamicContent(response.payload)
      expect(pageContent.heading).toEqual(getHeadingAndMeaningText(1).heading)
      expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(1).meaning)
      expect(pageContent.adminUpdatedData).toEqual(adminUpdatedDataText)
      expect(pageContent.orderP4Button).toEqual(orderP4ButtonText)
      expect(pageContent.rsBulletPoint).toEqual(false)
    })
  })

  describe('Flood zone 2', () => {
    it('should show RS title and bullet point, zone 2 low risk, 1 in 1000 SW text (FRA required)', async () => {
      const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz2_low}` })
      const pageContent = getFZ1DynamicContent(response.payload)
      expect(pageContent.heading).toEqual(getHeadingAndMeaningText(2).heading)
      expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(2).meaning)
      expect(pageContent.rsBulletPoint).toEqual(rsBulletPointText)
      expect(pageContent.fraTitle).toEqual(fraTitleText)
      expect(pageContent.rsSummaryTitle).toEqual(rsSummaryTitleText)
      expect(pageContent.fraRequired).toEqual(fraRequiredText)
      expect(pageContent.fzProbability).toEqual(getFZProbabilityText(2, 'medium'))
      expect(pageContent.swSummaryTitle).toEqual(getSWInfoText().swSummaryTitleText)
      expect(pageContent.swSummaryKeyCC).toEqual(getSWInfoText().swSummaryKeyCCText)
      expect(pageContent.swDoNotShowCC).toEqual(getSWInfoText().swDoNotShowCCText)
      expect(pageContent.swProbability).toEqual(getSWInfoText('0.1', '1 in 1000').swProbabilityText)
      expect(pageContent.orderP4Button).toEqual(orderP4ButtonText)
      expect(pageContent.fz1DataUnlikely).toEqual(false)
      expect(pageContent.adminUpdatedData).toEqual(false)
      expect(pageContent.siteDrawnIsLessThan).toEqual(false)
    })

    it('should show RS title and bullet point, zone 2 low risk, 1 in 100 SW text (FRA required)', async () => {
      const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz2_medium}` })
      const pageContent = getFZ1DynamicContent(response.payload)
      expect(pageContent.heading).toEqual(getHeadingAndMeaningText(2).heading)
      expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(2).meaning)
      expect(pageContent.rsBulletPoint).toEqual(rsBulletPointText)
      expect(pageContent.fraTitle).toEqual(fraTitleText)
      expect(pageContent.rsSummaryTitle).toEqual(rsSummaryTitleText)
      expect(pageContent.fraRequired).toEqual(fraRequiredText)
      expect(pageContent.fzProbability).toEqual(getFZProbabilityText(2, 'medium'))
      expect(pageContent.swSummaryTitle).toEqual(getSWInfoText().swSummaryTitleText)
      expect(pageContent.swSummaryKeyCC).toEqual(getSWInfoText().swSummaryKeyCCText)
      expect(pageContent.swDoNotShowCC).toEqual(getSWInfoText().swDoNotShowCCText)
      expect(pageContent.swProbability).toEqual(getSWInfoText('1', '1 in 100').swProbabilityText)
      expect(pageContent.orderP4Button).toEqual(orderP4ButtonText)
      expect(pageContent.adminUpdatedData).toEqual(false)
      expect(pageContent.siteDrawnIsLessThan).toEqual(false)
    })
  })

  describe('Flood zone 3', () => {
    it('Should have correct copy for Zone 3 high risk', async () => {
      const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.fz3_high}` })
      const pageContent = getFZ1DynamicContent(response.payload)
      expect(pageContent.heading).toEqual(getHeadingAndMeaningText(3).heading)
      expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(3).meaning)
      expect(pageContent.rsBulletPoint).toEqual(rsBulletPointText)
      expect(pageContent.fraTitle).toEqual(fraTitleText)
      expect(pageContent.fraRequired).toEqual(fraRequiredText)
      expect(pageContent.fzProbability).toEqual(getFZProbabilityText(3, 'high'))
      expect(pageContent.swSummaryTitle).toEqual(getSWInfoText().swSummaryTitleText)
      expect(pageContent.swSummaryKeyCC).toEqual(getSWInfoText().swSummaryKeyCCText)
      expect(pageContent.swDoNotShowCC).toEqual(getSWInfoText().swDoNotShowCCText)
      expect(pageContent.swProbability).toEqual(getSWInfoText('3.3', '1 in 30').swProbabilityText)
      expect(pageContent.orderP4Button).toEqual(orderP4ButtonText)
      expect(pageContent.adminUpdatedData).toEqual(false)
      expect(pageContent.siteDrawnIsLessThan).toEqual(false)
    })
  })

  describe('opted out area', () => {
    it('should not show the "Order flood risk data" for opted out areas', async () => {
      const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.optedOut.fz3_only}` })
      const pageContent = getFZ1DynamicContent(response.payload)
      expect(pageContent.heading).toEqual(getHeadingAndMeaningText(3).heading)
      expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(3).meaning)
      expect(pageContent.rsBulletPoint).toEqual(rsBulletPointText)
      expect(pageContent.orderP4Button).toEqual(false)
      expect(pageContent.adminUpdatedData).toEqual(false)
    })

    it('should not show the "Order flood risk data" for opted out areas in FZ1', async () => {
      const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.optedOut.fz1_only}` })
      const pageContent = getFZ1DynamicContent(response.payload)
      expect(pageContent.heading).toEqual(getHeadingAndMeaningText(1).heading)
      expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(1).meaning)
      expect(pageContent.rsBulletPoint).toEqual(false)
      expect(pageContent.orderP4Button).toEqual(false)
      expect(pageContent.adminUpdatedData).toEqual(false)
    })
  })
})

describe('Results Page On Internal', () => {
  beforeAll(() => { config.appType = 'internal' })
  it('should show the "Order flood risk data" for opted out areas on internal', async () => {
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.optedOut.fz3_only}` })
    const pageContent = getFZ1DynamicContent(response.payload)
    expect(pageContent.heading).toEqual(getHeadingAndMeaningText(3).heading)
    expect(pageContent.fzMeaningDescription).toEqual(getHeadingAndMeaningText(3).meaning)
    expect(pageContent.rsBulletPoint).toEqual(rsBulletPointText)
    expect(pageContent.adminUpdatedData).toEqual(false)
    expect(pageContent.orderP4Button).toEqual(orderP4ButtonText)
  })
})

const removeHtmlGaps = (text) => {
  return text.replace(/\s\s+/g, ' ').trim()
}

const getFZ1DynamicContent = (payload) => {
  document.body.innerHTML = payload
  const heading = document.querySelector('.govuk-heading-xl').textContent ? document.querySelector('.govuk-heading-xl').textContent : false
  const fzMeaningDescription = removeHtmlGaps(document.getElementById('fzMeaningDescription').textContent)
  const rsBulletPoint = document.getElementById('rsBulletPoint') ? removeHtmlGaps(document.getElementById('rsBulletPoint').textContent) : false
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
  const swDoNotShowCC = document.getElementById('swDoNotShowCC') ? removeHtmlGaps(document.getElementById('swDoNotShowCC').textContent) : false
  const swProbability = document.getElementById('swProbability') ? removeHtmlGaps(document.getElementById('swProbability').textContent) : false

  return {
    heading,
    fzMeaningDescription,
    rsBulletPoint,
    swBulletPoint,
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
    swDoNotShowCC,
    swProbability,
    fz23FRA
  }
}
