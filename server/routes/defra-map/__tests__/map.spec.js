const routes = require('../map')

const mockHapiRequest = {
  path: '/map',
  headers: { host: 'localhost' },
  server: { info: { protocol: 'https' } }
}

describe('/map page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render map view for /map', async () => {
    const mapRoute = routes.find((route) => route.path === '/map')
    const h = {
      view: jest.fn().mockReturnValue('MAP_VIEW')
    }

    const response = await mapRoute.options.handler({ ...mockHapiRequest, query: {} }, h)
    expect(h.view).toHaveBeenCalledWith('map')
    expect(response).toEqual('MAP_VIEW')
  })

  it.each([
    ['cz=100,200,5', '/map?map:center=100,200&map:zoom=5'],
    ['seg=sw', '/map?dataset=surfacewater'],
    ['seg=fz', '/map?dataset=floodzones'],
    ['seg=pd', '/map?timeframe=presentday'],
    ['seg=cl', '/map?timeframe=climatechange'],
    ['lyr=fsa', '/map?features=waterstorage'],
    ['lyr=fd', '/map?features=flooddefence'],
    ['lyr=mainr', '/map?features=mainrivers'],
    ['lyr=fsa,fd', '/map?features=waterstorage,flooddefence'],
    ['lyr=fsa,fd,mainr', '/map?features=waterstorage,flooddefence,mainrivers'],
    ['lyr=fsa,fd,mainr&features=waterstorage', '/map?features=waterstorage'],
    ['lyr=wrong&dataset=surfacewater', '/map?dataset=surfacewater'],
    ['seg=depth300', '/map?depth=extentsOver150'],
    ['seg=hr', '/map?aep=high'],
    ['cz=123,456,7&seg=mo', '/map?map:center=123,456&map:zoom=7&dataset=none'],
    ['seg=sw,pd,depth300,hr&cz=100,200,5', '/map?map:center=100,200&map:zoom=5&dataset=surfacewater&timeframe=presentday&depth=extentsOver150&aep=high'],
    ['seg=fz&other1=x&other2=y', '/map?dataset=floodzones&other1=x&other2=y'],
    ['other1=x&seg=fz', '/map?dataset=floodzones&other1=x'],
    ['timeframe=presentday&other1=x&seg=fz', '/map?dataset=floodzones&timeframe=presentday&other1=x'],
  ])('should redirect /map?%s to rewritten query', async (rawQuery, expectedLocation) => {
    const mapRoute = routes.find((route) => route.path === '/map')
    const h = {
      redirect: jest.fn().mockReturnValue('REDIRECT')
    }
    const query = Object.fromEntries(new URLSearchParams(rawQuery))

    const response = await mapRoute.options.handler({ ...mockHapiRequest, query }, h)
    expect(h.redirect).toHaveBeenCalledWith(expectedLocation)
    expect(response).toEqual('REDIRECT')
  })

  it('should not redirect when no legacy parameters are present', async () => {
    const mapRoute = routes.find((route) => route.path === '/map')
    const h = {
      view: jest.fn().mockReturnValue('MAP_VIEW'),
      redirect: jest.fn()
    }
    const query = { dataset: 'surfacewater', 'map:zoom': '5' }

    const response = await mapRoute.options.handler({ ...mockHapiRequest, query }, h)
    expect(h.redirect).not.toHaveBeenCalled()
    expect(h.view).toHaveBeenCalledWith('map')
    expect(response).toEqual('MAP_VIEW')
  })
})
