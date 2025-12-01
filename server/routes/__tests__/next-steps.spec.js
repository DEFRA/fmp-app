const { submitGetRequest } = require('../../__test-helpers__/server')
const { assertCopy } = require('../../__test-helpers__/copy')
const { mockPolygons } = require('../../services/__tests__/__mocks__/floodDataByPolygonMock')
const { config } = require('../../../config')
const wreck = require('@hapi/wreck')
jest.mock('../../services/agol/getContacts')
jest.mock('@hapi/wreck')

const url = '/next-steps'

const assertOrderFloodRiskDataButton = (expected = true) => {
  assertCopy('[data-testid="order-product4"]', expected && 'Order flood risk data')
  // Below email contact is hidden if the button is visible
  assertCopy('[data-testid="order-product4-email"]', !expected && 'To order flood risk data for this site, contact the Environment Agency team in Wessex at wessexenquiries@environment-agency.gov.uk')
}

describe('next-steps on internal', () => {
  beforeAll(() => { config.appType = 'internal' })
  it('should show the "Order flood risk data" for opted out areas on internal', async () => {
    wreck.get.mockResolvedValueOnce({ payload: { pauseP1DownloadFrom: null, pauseP1DownloadTo: null } })
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.optedOut.fz3_only}` })
    document.body.innerHTML = response.payload
    assertOrderFloodRiskDataButton(true)
    expect(response.result).toMatchSnapshot()
  })

  it('should log error when unable to get pause P1 config', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    wreck.get.mockRejectedValueOnce(new Error('Unable to fetch'))
    await submitGetRequest({ url: `${url}?polygon=${mockPolygons.optedOut.fz3_only}` })
    expect(consoleSpy).toHaveBeenCalledWith('Error getting p1 pause', expect.any(Error))
    consoleSpy.mockRestore()
  })
})

describe('next-steps on public', () => {
  beforeAll(() => { config.appType = 'public' })
  afterAll(() => { config.appType = 'internal' })
  it('should show the "Order flood risk data" for opted out areas on internal', async () => {
    wreck.get.mockResolvedValueOnce({ payload: { pauseP1DownloadFrom: null, pauseP1DownloadTo: null } })
    const response = await submitGetRequest({ url: `${url}?polygon=${mockPolygons.optedOut.fz3_only}` })
    document.body.innerHTML = response.payload
    assertOrderFloodRiskDataButton(false)
    expect(response.result).toMatchSnapshot()
  })

  it('should log error when unable to get pause P1 config', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    wreck.get.mockRejectedValueOnce(new Error('Unable to fetch'))
    await submitGetRequest({ url: `${url}?polygon=${mockPolygons.optedOut.fz3_only}` })
    expect(consoleSpy).toHaveBeenCalledWith('Error getting p1 pause', expect.any(Error))
  })
})
