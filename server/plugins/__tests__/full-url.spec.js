const { config } = require('../../../config')
const fullUrlPlugin = require('../full-url')
const h = {
  continue: Symbol('continue')
}

describe('full-url plugin', () => {
  let server
  beforeEach(() => {
    server = {
      ext: jest.fn()
    }
    fullUrlPlugin.plugin.register(server, {})
  })

  it('should include query parameters in fullUrl context for view responses', () => {
    const extension = server.ext.mock.calls[0][0]
    const onPostHandler = extension.method
    expect(server.ext).toHaveBeenCalledTimes(1)
    const request = {
      path: '/results',
      query: {
        polygon: 'abc123',
        source: 'river and sea'
      },
      response: {
        variety: 'view',
        source: {
          context: {}
        }
      }
    }
    const result = onPostHandler(request, h)
    expect(result).toBe(h.continue)
    expect(request.response.source.context.fullUrl).toEqual(
      encodeURI(`${config.siteUrl}/results?polygon=abc123&source=river and sea`)
    )
  })

  it('should set fullUrl without query string when request.query is missing', () => {
    const extension = server.ext.mock.calls[0][0]
    const onPostHandler = extension.method
    const request = {
      path: '/results',
      response: {
        variety: 'view',
        source: {
          context: {}
        }
      }
    }
    const result = onPostHandler(request, h)
    expect(result).toBe(h.continue)
    expect(request.response.source.context.fullUrl).toEqual(
      encodeURI(`${config.siteUrl}/results`)
    )
  })

  it('should create context when response context is missing', () => {
    const extension = server.ext.mock.calls[0][0]
    const onPostHandler = extension.method
    const request = {
      path: '/results',
      response: {
        variety: 'view',
        source: {}
      }
    }
    const result = onPostHandler(request, h)
    expect(result).toBe(h.continue)
    expect(request.response.source.context).toEqual({
      fullUrl: encodeURI(`${config.siteUrl}/results`)
    })
  })
})
