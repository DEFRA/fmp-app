const routes = require('../index')

describe('defra-map routes', () => {
  it('should render map view for /map', async () => {
    const mapRoute = routes.find((route) => route.path === '/map')
    const h = {
      view: jest.fn().mockReturnValue('MAP_VIEW')
    }
    const response = await mapRoute.options.handler({}, h)
    expect(h.view).toHaveBeenCalledWith('map')
    expect(response).toEqual('MAP_VIEW')
  })
})
