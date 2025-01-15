const { mockEsriRequest, stopMockingEsriRequests } = require('./__mocks__/agol')
const createServer = require('../../../server')

describe('getContacts', () => {
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

  const errorsToTest = [
    ['false', false],
    ['a non array', 'not-array']
  ]
  errorsToTest.forEach(([titleText, returnValue]) => {
    it(`if esriRequest returns ${titleText} expect an error`, async () => {
      mockEsriRequest(returnValue)
      const { getContacts } = require('../../services/agol/getContacts')
      try {
        await getContacts({ geometryType: 'esriGeometryPolygon', polygon: [[1, 2], [3, 4]] })
      } catch (error) {
        expect(error.message).toEqual('Invalid response from AGOL customerTeam request')
      }
    })
  })
})
