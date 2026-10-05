const routes = require('../styles/index')

describe('map style.json routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const paths = [
    '/map/styles/open-tile.json',
    '/map/styles/vts-tile.json',
    '/map/styles/black-and-white-map',
    '/map/productFourStyles/black-and-white-map',
    '/map/productFourStyles/black-and-white-map.json',
    '/map/styles/master-map',
    '/map/styles/master-map-dark',
  ]
  paths.forEach((path) => {
    it(`should serve ${path}`, async () => {
      const mapStylesRoute = routes.find((route) => route.path === path)
      expect(mapStylesRoute).toBeDefined()
      const response = await mapStylesRoute.handler()
      expect(response).toBeDefined()
      // response is already a parsed JSON object, not a string
      expect(() => JSON.stringify(response)).not.toThrow()
    })
  })
})
