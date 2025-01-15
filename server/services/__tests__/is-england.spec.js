require('dotenv').config({ path: 'config/.env-example' })

const createServer = require('../../../server')
const { mockEsriRequest, stopMockingEsriRequests } = require('./__mocks__/agol')

describe('is-england', () => {
  let server
  let isEnglandService

  beforeEach(async () => {
    mockEsriRequest()
    // isEnglandService must be required AFTER esriRequest is mocked
    isEnglandService = require('../../services/is-england')
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
    stopMockingEsriRequests()
  })

  it('is-england without easting or northing should throw "No point provided"', async () => {
    const point = {}
    try {
      await isEnglandService.get(point.easting, point.northing)
    } catch (err) {
      expect(isEnglandService.get).toThrow(Error, 'No point provided')
    }
  })

  it('is-england without easting should throw "No point provided"', async () => {
    const point = { northing: 388244 }
    try {
      await isEnglandService.get(point.easting, point.northing)
    } catch (err) {
      expect(isEnglandService.get).toThrow(Error, 'No point provided')
    }
  })

  it('is-england without northing should throw "No point provided"', async () => {
    const point = { easting: 388244 }
    try {
      await isEnglandService.get(point.easting, point.northing)
    } catch (err) {
      expect(isEnglandService.get).toThrow(Error, 'No point provided')
    }
  })

  it('is-england with northing and easting should call esriRequest"', async () => {
    const point = { northing: 388244, easting: 388244 }
    const response = await isEnglandService.get(point.easting, point.northing)
    expect(response).toEqual({ is_england: true })
  })
})
