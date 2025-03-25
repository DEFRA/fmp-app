const {
  submitGetRequest,
  getServer
} = require('../../__test-helpers__/server')

const constants = require('../../constants')

const url = constants.routes.FEEDBACK

describe('Feedback', () => {
  it('Should return feedback page with ref being set as feedback', async () => {
    const server = getServer()
    server.ext('onPreHandler', (request, h) => {
      request.info.referrer = 'http://localhost:3000/feedback'
      request.server.info.protocol = 'https'
      request.info.host = 'localhost:3000'
      return h.continue
    })
    const response = await submitGetRequest({ url })
    expect(response.result).toMatchSnapshot()
  })

  it('Should return feedback page with ref being set without feedback', async () => {
    const server = getServer()
    server.ext('onPreHandler', (request, h) => {
      request.info.referrer = 'http://localhost:3000/map'
      return h.continue
    })

    const response = await submitGetRequest({ url })
    expect(response.result).toMatchSnapshot()
  })

  it('Should return feedback page with userAgent being set', async () => {
    const server = getServer()
    server.ext('onPreHandler', (request, h) => {
      request.info.referrer = ''
      request.server.info.protocol = 'https'
      request.info.host = 'localhost:3000'
      return h.continue
    })
    const response = await submitGetRequest({ url, headers: { 'user-agent': 'test agent' } })
    expect(response.result).toMatchSnapshot()
  })

  it('Should return feedback page with no userAgent', async () => {
    const server = getServer()
    server.ext('onPreHandler', (request, h) => {
      request.info.referrer = ''
      request.server.info.protocol = 'https'
      request.info.host = 'localhost:3000'
      return h.continue
    })
    const response = await submitGetRequest({ url, headers: { 'user-agent': undefined } })
    expect(response.result).toMatchSnapshot()
  })
})
