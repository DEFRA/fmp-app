require('dotenv').config({ path: 'config/.env-example' })
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const createServer = require('../../server')
const axios = require('axios')
const { config } = require('../../config')

lab.experiment('product-1.js', () => {
  let server
  const AxiosMockAdapter = require('axios-mock-adapter')
  const mockAxios = new AxiosMockAdapter(axios)

  const getProduct1Url = config.eamaps.serviceUrl + config.eamaps.product1EndPoint
  const getTokenUrl = config.eamaps.serviceUrl + config.eamaps.tokenEndPoint
  const mockPdfUrl = 'PDF_URL'

  const validPdfResponse = {
    results: [
      { paramName: 'pdfFile', dataType: 'GPDataFile', value: { url: mockPdfUrl } },
      { paramName: 'error', dataType: 'GPString', value: '' }
    ]
  }

  const invalidPdfResponse = {
    results: [
      { paramName: 'pdfFile', dataType: 'GPDataFile', value: null },
      { paramName: 'pdfFile', dataType: 'GPDataFile', value: {} }, // increase coverage
      { paramName: 'error', dataType: 'GPString', value: 'ERR' },
      { paramName: 'anything', dataType: 'GPString', value: 'for test coverage only' }
    ]
  }

  lab.before(async () => {
    server = await createServer()
    await server.initialize()
  })

  lab.beforeEach(async () => {
    mockAxios.onPost(getTokenUrl)
      .reply(200, { token: 'XXX', expires: 99999999999 })

    mockAxios.onPost(getProduct1Url)
      .reply(200, validPdfResponse)

    mockAxios.onGet(mockPdfUrl)
      .reply(200, 'PDF_STREAM')
  })

  lab.after(async () => {
    server = await createServer()
    await server.stop()
    mockAxios.restore()
  })
  const product1Payload = {
    polygon: '[[1,2], [3,4]]',
    scale: 2500,
    reference: '',
    holdingComments: 'true'
  }

  lab.test('product-1 route should return a PDF Stream', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/product-1',
      payload: product1Payload
    })
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.result).to.equal('PDF_STREAM')
  })

  lab.test('product-1 route should catch an error when returned by getToken', async () => {
    mockAxios.onPost(getTokenUrl)
      .reply(200, { token: 'XXX', expires: 99999999999, error: { message: 'Mocked Error' } })

    const response = await server.inject({
      method: 'POST',
      url: '/product-1',
      payload: product1Payload
    })
    Code.expect(response.statusCode).to.equal(500)
    // NB The current response when an error occurs is a redirect to a generic error page
    // FCRM-5373 has been raised to determine a better UX
  })

  lab.test('product-1 route should catch an error when returned by eamaps getProduct1', async () => {
    mockAxios.onPost(getProduct1Url).reply(200, invalidPdfResponse)

    const response = await server.inject({
      method: 'POST',
      url: '/product-1',
      payload: product1Payload
    })
    Code.expect(response.statusCode).to.equal(500)
    // NB The current response when an error occurs is a redirect to a generic error page
    // FCRM-5373 has been raised to determine a better UX
  })

  // server/services/eaMaps/getProduct1.js missing coverage on line(s): 16-19, 26, 57-63
  // server/services/eaMaps/getToken.js missing coverage on line(s): 15, 16, 40, 52-54
  const unexpectedResponses = [
    [{}, 'no results'],
    [{ results: 'not an array' }, "results that aren't an array"],
    [{ results: [] }, 'results that are an empty array']
  ]
  unexpectedResponses.forEach(([getProduct1Response, description]) => {
    lab.test(`product-1 route should catch an error when eamaps getProduct1 returns ${description}`, async () => {
      mockAxios.onPost(getProduct1Url).reply(200, getProduct1Response)

      const response = await server.inject({
        method: 'POST',
        url: '/product-1',
        payload: product1Payload
      })
      Code.expect(response.statusCode).to.equal(500)
      // NB The current response when an error occurs is a redirect to a generic error page
      // FCRM-5373 has been raised to determine a better UX
    })
  })
})
