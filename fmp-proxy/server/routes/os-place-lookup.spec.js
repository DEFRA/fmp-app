describe('os-place-lookup route', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      FMPPROXYPORT: '8060',
      ordnanceSurveyOsSearchKey: 'test-os-search-key',
      ordnanceSurveyOsClientId: 'os-client-id',
      ordnanceSurveyOsClientSecret: 'os-client-secret',
      OS_TOKEN_URL: 'https://api.os.uk/oauth2/token/v1'
    }
  })

  afterEach(() => {
    process.env = originalEnv
    jest.restoreAllMocks()
  })

  describe('route configuration', () => {
    it('has correct HTTP methods', () => {
      const route = require('./os-place-lookup')
      expect(route.method).toEqual(['GET', 'POST'])
    })

    it('has correct path with query parameter', () => {
      const route = require('./os-place-lookup')
      expect(route.path).toBe('/proxy/place-lookup/{query}')
    })

    it('disables authentication', () => {
      const route = require('./os-place-lookup')
      expect(route.options.auth).toBe(false)
    })

    it('uses proxy handler with mapUri', () => {
      const route = require('./os-place-lookup')
      expect(route.options.handler.proxy.passThrough).toBe(true)
      expect(typeof route.options.handler.proxy.mapUri).toBe('function')
    })

    it('has correct description', () => {
      const route = require('./os-place-lookup')
      expect(route.options.description).toContain('place lookup')
      expect(route.options.description).toContain('bearer token')
    })
  })

  describe('upstream URL construction', () => {
    it('constructs correct OS API endpoint with query parameter', async () => {
      const logDebugMock = jest.fn()
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: logDebugMock
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-place-lookup')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { query: 'London' },
        url: {
          href: 'http://localhost:3005/proxy/place-lookup/London'
        }
      })

      expect(result.uri).toContain('https://api.os.uk/search/names/v1/find')
      expect(result.uri).toContain('query=London')
    })

    it('includes place type filter in URL', async () => {
      const logDebugMock = jest.fn()
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: logDebugMock
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-place-lookup')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { query: 'London' },
        url: {
          href: 'http://localhost:3005/proxy/place-lookup/London'
        }
      })

      expect(result.uri).toContain('fq=local_type:postcode')
      expect(result.uri).toContain('local_type:hamlet')
      expect(result.uri).toContain('local_type:village')
      expect(result.uri).toContain('local_type:town')
      expect(result.uri).toContain('local_type:city')
      expect(result.uri).toContain('local_type:suburban_area')
      expect(result.uri).toContain('local_type:other_settlement')
    })

    it('includes maxresults=100 parameter', async () => {
      const logDebugMock = jest.fn()
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: logDebugMock
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-place-lookup')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { query: 'Brighton' },
        url: {
          href: 'http://localhost:3005/proxy/place-lookup/Brighton'
        }
      })

      expect(result.uri).toContain('maxresults=100')
    })

    it('handles URL-encoded queries correctly', async () => {
      const logDebugMock = jest.fn()
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: logDebugMock
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-place-lookup')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { query: 'Brighton%20and%20Hove' },
        url: {
          href: 'http://localhost:3005/proxy/place-lookup/Brighton%20and%20Hove'
        }
      })

      expect(result.uri).toContain('query=Brighton%20and%20Hove')
    })

    it('passes single character queries through', async () => {
      const logDebugMock = jest.fn()
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: logDebugMock
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-place-lookup')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { query: 'b' },
        url: {
          href: 'http://localhost:3005/proxy/place-lookup/b'
        }
      })

      expect(result.uri).toContain('query=b')
    })
  })

  describe('authorization and token handling', () => {
    it('includes Bearer token in response headers', async () => {
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'test-bearer-token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: jest.fn()
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-place-lookup')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { query: 'London' },
        url: {
          href: 'http://localhost:3005/proxy/place-lookup/London'
        }
      })

      expect(result.headers).toEqual({ authorization: 'Bearer test-bearer-token' })
    })

    it('fetches token for every request', async () => {
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: jest.fn()
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-place-lookup')
      await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { query: 'London' },
        url: {
          href: 'http://localhost:3005/proxy/place-lookup/London'
        }
      })

      expect(getOsTokenMock).toHaveBeenCalledTimes(1)
    })

    it('logs token fetch errors', async () => {
      const logDebugMock = jest.fn()
      const getOsTokenMock = jest.fn().mockRejectedValue(new Error('Token service unavailable'))

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: logDebugMock
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-place-lookup')

      await expect(
        route.options.handler.proxy.mapUri({
          method: 'GET',
          params: { query: 'London' },
          url: {
            href: 'http://localhost:3005/proxy/place-lookup/London'
          }
        })
      ).rejects.toThrow('Token service unavailable')
    })

    it('re-throws token fetch errors', async () => {
      const getOsTokenMock = jest.fn().mockRejectedValue(new Error('API error'))

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: jest.fn()
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-place-lookup')

      await expect(
        route.options.handler.proxy.mapUri({
          method: 'GET',
          params: { query: 'London' },
          url: {
            href: 'http://localhost:3005/proxy/place-lookup/London'
          }
        })
      ).rejects.toThrow('API error')
    })
  })

  describe('request logging', () => {
    it('logs incoming request details', async () => {
      const logDebugMock = jest.fn()
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: logDebugMock
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-place-lookup')
      await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { query: 'London' },
        url: {
          href: 'http://localhost:3005/proxy/place-lookup/London'
        }
      })

      expect(logDebugMock).toHaveBeenCalledWith(
        'os lookup request received',
        expect.objectContaining({
          method: 'GET',
          requestUrl: 'http://localhost:3005/proxy/place-lookup/London'
        })
      )
    })

    it('logs upstream URL resolution', async () => {
      const logDebugMock = jest.fn()
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: logDebugMock
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-place-lookup')
      await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { query: 'London' },
        url: {
          href: 'http://localhost:3005/proxy/place-lookup/London'
        }
      })

      expect(logDebugMock).toHaveBeenCalledWith(
        'os lookup upstream resolved',
        expect.objectContaining({
          upstreamUrl: expect.stringContaining('https://api.os.uk/search/names/v1/find')
        })
      )
    })

    it('logs HTTP method', async () => {
      const logDebugMock = jest.fn()
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: logDebugMock
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-place-lookup')
      await route.options.handler.proxy.mapUri({
        method: 'POST',
        params: { query: 'London' },
        url: {
          href: 'http://localhost:3005/proxy/place-lookup/London'
        }
      })

      expect(logDebugMock).toHaveBeenCalledWith(
        'os lookup request received',
        expect.objectContaining({
          method: 'POST'
        })
      )
    })
  })

  describe('HTTP methods', () => {
    it('accepts GET requests', async () => {
      const logDebugMock = jest.fn()
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: logDebugMock
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-place-lookup')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { query: 'London' },
        url: {
          href: 'http://localhost:3005/proxy/place-lookup/London'
        }
      })

      expect(result.uri).toBeDefined()
      expect(result.headers).toBeDefined()
    })

    it('accepts POST requests', async () => {
      const logDebugMock = jest.fn()
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: logDebugMock
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-place-lookup')
      const result = await route.options.handler.proxy.mapUri({
        method: 'POST',
        params: { query: 'London' },
        url: {
          href: 'http://localhost:3005/proxy/place-lookup/London'
        }
      })

      expect(result.uri).toBeDefined()
    })
  })

  describe('edge cases', () => {
    it('handles special characters in query', async () => {
      const logDebugMock = jest.fn()
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: logDebugMock
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-place-lookup')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { query: "St%20John's" },
        url: {
          href: "http://localhost:3005/proxy/place-lookup/St%20John's"
        }
      })

      expect(result.uri).toContain("query=St%20John's")
    })

    it('handles long query strings', async () => {
      const longQuery = 'a'.repeat(500)
      const logDebugMock = jest.fn()
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: logDebugMock
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-place-lookup')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { query: longQuery },
        url: {
          href: `http://localhost:3005/proxy/place-lookup/${longQuery}`
        }
      })

      expect(result.uri).toContain(`query=${longQuery}`)
    })

    it('handles empty query parameter', async () => {
      const logDebugMock = jest.fn()
      const getOsTokenMock = jest.fn().mockResolvedValue({ access_token: 'token' })

      jest.doMock('../services/proxyDebug', () => ({
        logDebug: logDebugMock
      }))
      jest.doMock('../services/getOsToken', () => ({
        getOsToken: getOsTokenMock
      }))

      const route = require('./os-place-lookup')
      const result = await route.options.handler.proxy.mapUri({
        method: 'GET',
        params: { query: '' },
        url: {
          href: 'http://localhost:3005/proxy/place-lookup/'
        }
      })

      expect(result.uri).toContain('query=')
    })
  })
})
