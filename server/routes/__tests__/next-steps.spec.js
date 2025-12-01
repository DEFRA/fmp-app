const { submitGetRequest } = require('../../__test-helpers__/server')
const { assertCopy } = require('../../__test-helpers__/copy')
const { mockPolygons } = require('../../services/__tests__/__mocks__/floodDataByPolygonMock')
const { getProductOnePause } = require('../../services/getProductOnePause')
const { config } = require('../../../config')
jest.mock('../../services/agol/getContacts')
jest.mock('../../services/getProductOnePause')

const url = '/next-steps'

const assertOrderFloodRiskDataButton = (expected = true) => {
  assertCopy('[data-testid="order-product4"]', expected && 'Order flood risk data')
  // Below email contact is hidden if the button is visible
  assertCopy('[data-testid="order-product4-email"]', !expected && 'To order flood risk data for this site, contact the Environment Agency team in Wessex at wessexenquiries@environment-agency.gov.uk')
}

describe('next-steps on internal', () => {
  beforeAll(() => { config.appType = 'internal' })
  it('should show the "Order flood risk data" for opted out areas on internal', async () => {
    getProductOnePause.mockReturnValueOnce({ pauseP1DownloadFrom: null, pauseP1DownloadTo: null })
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.optedOut.fz3_only}` })
    document.body.innerHTML = response.payload
    assertOrderFloodRiskDataButton(true)
    expect(response.result).toMatchSnapshot()
  })

  it('should pass pause P1 download data to the view', async () => {
    Date.now = jest.fn(() => 1764258880000)
    getProductOnePause.mockReturnValueOnce({ pauseP1DownloadFrom: 1764257880000, pauseP1DownloadTo: 1764265080000 })
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.optedOut.fz3_only}` })
    const pageContent = response.payload
    expect(pageContent).toContain('You will be able to use the service from 5.38pm on Thursday 27 November 2025.')
  })

  it('should still return page successfully if API call fails', async () => {
    getProductOnePause.mockReturnValueOnce(new Error('Unable to fetch'))
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.optedOut.fz3_only}` })
    expect(response.statusCode).toEqual(200)
    expect(response.result).toMatchSnapshot()
  })
})

describe('next-steps on public', () => {
  beforeAll(() => { config.appType = 'public' })
  afterAll(() => { config.appType = 'internal' })
  it('should show the "Order flood risk data" for opted out areas on internal', async () => {
    getProductOnePause.mockReturnValueOnce({ pauseP1DownloadFrom: null, pauseP1DownloadTo: null })
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.optedOut.fz3_only}` })
    document.body.innerHTML = response.payload
    assertOrderFloodRiskDataButton(false)
    expect(response.result).toMatchSnapshot()
  })

  it('should pass pause P1 download data to the view', async () => {
    Date.now = jest.fn(() => 1764258880000)
    getProductOnePause.mockReturnValueOnce({ pauseP1DownloadFrom: 1764257880000, pauseP1DownloadTo: 1764265080000 })
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.optedOut.fz3_only}` })
    const pageContent = response.payload
    expect(pageContent).toContain('You will be able to use the service from 5.38pm on Thursday 27 November 2025.')
  })

  it('should still return page successfully if API call fails', async () => {
    getProductOnePause.mockReturnValueOnce(new Error('Unable to fetch'))
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.optedOut.fz3_only}` })
    expect(response.statusCode).toEqual(200)
    expect(response.result).toMatchSnapshot()
  })
})
