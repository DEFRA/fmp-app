const { submitGetRequest } = require('../../__test-helpers__/server')
const { getHostAndProtocol } = require('../../services/getHostAndProtocol')

jest.mock('../../services/getHostAndProtocol', () => ({ getHostAndProtocol: jest.fn() }))

describe('healthcheck', () => {
  it('Should get /healthcheck successfully', async () => {
    getHostAndProtocol.mockReturnValue(null)
    const response = await submitGetRequest({ url: '/healthcheck' })
    expect(response.result).toMatchSnapshot()
  })
  it('Should get /health-check successfully', async () => {
    getHostAndProtocol.mockReturnValue('http://localhost:3000')
    const response = await submitGetRequest({ url: '/health-check' })
    expect(response.result).toMatchSnapshot()
  })
})
