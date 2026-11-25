const { submitGetRequest } = require('../../__test-helpers__/server')
const { assertCopy } = require('../../__test-helpers__/copy')

const url = '/'
describe('home route', () => {
  let response

  beforeEach(async () => {
    response = await submitGetRequest({ url }, 'Get flood risk information for a planning application in England')
    document.body.innerHTML = response.payload
  })

  it('should match snapshot', () => {
    expect(response.result).toMatchSnapshot()
  })

  it('should return a 200 status code', async () => {
    expect(response.statusCode).toEqual(200)
  })

  it('should have a footer that contains OS link titled Ordance Survey (OS)', async () => {
    assertCopy('a[href="https://www.ordnancesurvey.co.uk/"]', 'Ordnance Survey(OS)')
    assertCopy('a[href="/os-terms"]', 'Ordnance Survey terms and conditions')
    assertCopy('.govuk-list.govuk-list--bullet', 'view, download and print a flood map for planning')
    assertCopy('footer.govuk-footer', 'AC0000807064')
  })

  describe('when homePageRedirectUrl is configured', () => {
    const redirectUrl = 'https://www.gov.uk/check-flooding'

    const getHandler = () => {
      let handler
      jest.isolateModules(() => {
        jest.doMock('../../../config', () => ({ config: { homePageRedirectUrl: redirectUrl } }))
        handler = require('../home')[0].options.handler
      })
      return handler
    }

    afterEach(() => {
      jest.dontMock('../../../config')
    })

    it('should permanently redirect (301) to the configured url', async () => {
      const permanent = jest.fn().mockReturnValue('redirected')
      const redirect = jest.fn().mockReturnValue({ permanent })
      const view = jest.fn()

      const result = await getHandler()({}, { redirect, view })

      expect(redirect).toHaveBeenCalledWith(redirectUrl)
      expect(permanent).toHaveBeenCalled()
      expect(view).not.toHaveBeenCalled()
      expect(result).toBe('redirected')
    })
  })
})
