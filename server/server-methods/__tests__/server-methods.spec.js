const createServer = require('../../../server')
const serverMethods = require('../server-methods')
const { mockEsriRequest, stopMockingEsriRequests } = require('../../services/__tests__/__mocks__/agol')

describe('pso-contact-by-polygon', () => {
  let server

  beforeAll(async () => {
    mockEsriRequest()
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
    stopMockingEsriRequests()
  })

  it('pso-contact-by-polygon generateKey', async () => {
    const { generateKey } = serverMethods[0].options
    const key = generateKey([[1, 2], [3, 4]])
    expect(key).toEqual('[[1,2],[3,4]]')
    expect(key).toEqual('[[1,2],[3,4]]')
  })

  it('getFloodDataByPolygon generateKey', async () => {
    const { generateKey } = serverMethods[1].options
    const key = generateKey([[1, 2], [3, 4]])
    expect(key).toEqual('[[1,2],[3,4]]')
    expect(key).toEqual('[[1,2],[3,4]]')
  })
})
