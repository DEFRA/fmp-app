const { getEsriToken } = require('../../../services/agol/getEsriToken')
const { getOsToken } = require('../../../services/os/getOsToken')
const routes = require('../index')
jest.mock('../../../services/agol/getEsriToken', () => ({
  getEsriToken: jest.fn()
}))
jest.mock('../../../services/os/getOsToken', () => ({
  getOsToken: jest.fn()
}))

describe('defra-map routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render map view for /map', async () => {
    const mapRoute = routes.find((route) => route.path === '/map')
    const h = {
      view: jest.fn().mockReturnValue('MAP_VIEW')
    }
    const response = await mapRoute.options.handler({}, h)
    expect(h.view).toHaveBeenCalledWith('map')
    expect(response).toEqual('MAP_VIEW')
  })

  it('should return OS token for /os-token', async () => {
    const osTokenRoute = routes.find((route) => route.path === '/os-token')
    getOsToken.mockResolvedValue('OS_TOKEN')
    const response = await osTokenRoute.options.handler({}, {})
    expect(getOsToken).toHaveBeenCalledTimes(1)
    expect(response).toEqual('OS_TOKEN')
  })

  it('should call ESRI token with default refresh false for /esri-token', async () => {
    const esriTokenRoute = routes.find((route) => route.path === '/esri-token')
    getEsriToken.mockResolvedValue('ESRI_TOKEN')
    const response = await esriTokenRoute.options.handler({ query: {} }, {})
    expect(getEsriToken).toHaveBeenCalledWith(false)
    expect(response).toEqual('ESRI_TOKEN')
  })
})
