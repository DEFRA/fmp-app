const { mockEsriRequest, stopMockingEsriRequests } = require('./__mocks__/agol')
const createServer = require('../../../server')

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

  it('pso-contact-by-polygon getPsoContactsByPolygon should throw if invalid result returned', async () => {
    let asserted = false
    const getPsoContactsByPolygon = server.methods.getPsoContactsByPolygon // psoContactByPolygonExport.method
    try {
      mockEsriRequest('invalid response')
      await getPsoContactsByPolygon([[1, 2], [3, 4]])
    } catch (err) {
      expect(err.message).toEqual('Fetching Pso contacts by polygon failed: ')
      asserted = true
    }
    // Now ensure the assertion was actually made
    expect(asserted).toEqual(true)
  })
})
