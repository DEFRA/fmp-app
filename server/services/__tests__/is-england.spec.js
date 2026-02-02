const createServer = require('../../../server')
const { mockEsriRequest, stopMockingEsriRequests } = require('./__mocks__/agol')

describe('is-england', () => {
  let server
  let isEnglandService

  beforeEach(async () => {
    mockEsriRequest()
    // isEnglandService must be required AFTER esriFeatureRequest is mocked
    isEnglandService = require('../../services/is-england')
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
    stopMockingEsriRequests()
  })

  it('is-england without easting or northing should throw "No point provided"', async () => {
    await expect(
      isEnglandService.isEnglandService(undefined, undefined)
    ).rejects.toThrow('No point provided')
  })

  it('is-england without easting should throw "No point provided"', async () => {
    await expect(
      isEnglandService.isEnglandService(undefined, 388244)
    ).rejects.toThrow('No point provided')
  })

  it('is-england without northing should throw "No point provided"', async () => {
    await expect(
      isEnglandService.isEnglandService(388244, undefined)
    ).rejects.toThrow('No point provided')
  })

  it('is-england with northing and easting should call esriFeatureRequest"', async () => {
    const point = { northing: 388244, easting: 388244 }
    const response = await isEnglandService.isEnglandService(point.easting, point.northing)
    expect(response).toEqual(true)
  })
})
