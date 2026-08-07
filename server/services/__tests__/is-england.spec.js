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

  describe('isEnglandService', () => {
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

  describe('isPolygonInEngland', () => {
    const polygon = [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]

    it('should throw "No polygon provided" when polygon is undefined', async () => {
      await expect(
        isEnglandService.isPolygonInEngland(undefined)
      ).rejects.toThrow('No polygon provided')
    })

    it('should throw "No polygon provided" when polygon is null', async () => {
      await expect(
        isEnglandService.isPolygonInEngland(null)
      ).rejects.toThrow('No polygon provided')
    })

    it('should return true when esriFeatureRequest returns a non-empty array', async () => {
      const response = await isEnglandService.isPolygonInEngland(polygon)
      expect(response).toEqual(true)
    })

    it('should return false when esriFeatureRequest returns an empty array', async () => {
      const { mockEsriRequest: mockEmpty } = require('./__mocks__/agol')
      mockEmpty([])
      const response = await isEnglandService.isPolygonInEngland(polygon)
      expect(response).toEqual(false)
    })
  })
})
