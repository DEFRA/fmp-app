require('dotenv').config({ path: 'config/.env-example' })
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const createServer = require('../../server')
const axios = require('axios')

lab.experiment('product-1.js', () => {
  let server
  const AxiosMockAdapter = require('axios-mock-adapter')
  const mockAxios = new AxiosMockAdapter(axios)

  lab.before(async () => {
    mockAxios.onPost('http://dummyEAMapslUrl/tokens/generateToken')
      .reply(200, { token: 'XXX', expires: 99999999999 })

    mockAxios.onPost('http://dummyEAMapslUrl/rest/services/FMfP/FMFPGetProduct1/GPServer/fmfp_get_product1/execute')
      .reply(200, { results: [{ value: { url: 'PDF_URL' } }] })

    mockAxios.onGet('PDF_URL')
      .reply(200, 'PDF_STREAM')

    server = await createServer()
    await server.initialize()
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
    mockAxios.onPost('http://dummyEAMapslUrl/tokens/generateToken')
      .reply(200, { token: 'XXX', expires: 99999999999, error: { message: 'Mocked Error' } })

    const response = await server.inject({
      method: 'POST',
      url: '/product-1',
      payload: product1Payload
    })
    Code.expect(response.statusCode).to.equal(500)
  })
})
