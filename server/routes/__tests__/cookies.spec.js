const {
  submitGetRequest,
  getServer
} = require('../../__test-helpers__/server')
const constants = require('../../constants')

const url = constants.routes.COOKIES

describe('cookies', () => {
  it('Should return cookies page successfully with no prior consent', async () => {
    const response = await submitGetRequest({ url }, 'Cookies')
    expect(response.statusCode).toBe(200)
    expect(response.result).toContain('Do you want to accept analytics cookies?')
  })
  it('Should return cookies page successfully with cookies accepted', async () => {
    const cookieValue = Buffer.from(JSON.stringify({ confirmed: true, essential: true, analytics: true })).toString('base64')
    const response = await submitGetRequest({ url, headers: { Cookie: `fmp_cookie_policy=${cookieValue}` } }, 'Cookies')
    expect(response.statusCode).toBe(200)
    expect(response.result).toContain('Do you want to accept analytics cookies?')
  })
  it('Should return cookies page successfully with cookies rejected', async () => {
    const cookieValue = Buffer.from(JSON.stringify({ confirmed: true, essential: true, analytics: false })).toString('base64')
    const response = await submitGetRequest({ url, headers: { Cookie: `fmp_cookie_policy=${cookieValue}` } }, 'Cookies')
    expect(response.statusCode).toBe(200)
    expect(response.result).toContain('Do you want to accept analytics cookies?')
  })
  it('Should include query string in currentPath', async () => {
    const response = await submitGetRequest({ url: `${url}?ref=footer` }, 'Cookies')
    expect(response.statusCode).toBe(200)
    expect(response.result).toContain('returnUrl" value="/cookies?ref=footer"')
  })

  describe('POST', () => {
    it('Should return JSON for async request', async () => {
      const response = await getServer().inject({
        method: 'POST',
        url,
        payload: {
          analytics: true,
          async: true
        }
      })
      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.payload)).toEqual({ message: 'success' })
    })

    it('Should redirect to returnUrl when it is a safe path', async () => {
      const response = await getServer().inject({
        method: 'POST',
        url,
        payload: {
          analytics: false,
          async: false,
          returnUrl: '/some-page?query=1'
        }
      })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/some-page?query=1')
    })

    it('Should not redirect to an unsafe returnUrl', async () => {
      const response = await getServer().inject({
        method: 'POST',
        url,
        payload: {
          analytics: true,
          async: false,
          returnUrl: '//evil.com'
        }
      })
      expect(response.statusCode).toBe(200)
      expect(response.result).toContain('You\'ve set your cookie preferences.')
    })

    it('Should re-render the cookies page with success banner when no returnUrl', async () => {
      const response = await getServer().inject({
        method: 'POST',
        url,
        payload: {
          analytics: false,
          async: false,
          referer: '/previous-page'
        }
      })
      expect(response.statusCode).toBe(200)
      expect(response.result).toContain('You\'ve set your cookie preferences.')
    })

    it('Should remove legacy GA cookie when present', async () => {
      const response = await getServer().inject({
        method: 'POST',
        url,
        headers: { cookie: 'GA=Accept' },
        payload: {
          analytics: true,
          async: true
        }
      })
      expect(response.statusCode).toBe(200)
      const setCookies = response.headers['set-cookie']
      const gaUnset = setCookies.some((c) => c.startsWith('GA=') && c.includes('Expires='))
      expect(gaUnset).toBe(true)
    })

    it('Should remove GA analytics cookies when rejecting', async () => {
      const response = await getServer().inject({
        method: 'POST',
        url,
        headers: { cookie: '_ga=test123; _gid=test456' },
        payload: {
          analytics: false,
          async: true
        }
      })
      expect(response.statusCode).toBe(200)
      const setCookies = response.headers['set-cookie']
      const gaUnset = setCookies.some((c) => c.startsWith('_ga='))
      const gidUnset = setCookies.some((c) => c.startsWith('_gid='))
      expect(gaUnset).toBe(true)
      expect(gidUnset).toBe(true)
    })
  })
})
