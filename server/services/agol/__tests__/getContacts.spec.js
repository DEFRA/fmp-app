const { mockEsriRequest, stopMockingEsriRequests } = require('../../../services/__tests__/__mocks__/agol')

describe('getContacts', () => {
  beforeAll(async () => {
    mockEsriRequest()
  })

  afterAll(async () => {
    stopMockingEsriRequests()
  })

  const errorsToTest = [
    ['false', false],
    ['a non array', 'not-array']
  ]
  errorsToTest.forEach(([titleText, returnValue]) => {
    it(`if esriRequest returns ${titleText} expect an error`, async () => {
      mockEsriRequest(returnValue)
      const { getContacts } = require('../getContacts')
      try {
        await getContacts({ geometryType: 'esriGeometryPolygon', polygon: [[1, 2], [3, 4]] })
      } catch (error) {
        expect(error.message).toEqual('Invalid response from AGOL customerTeam request')
      }
    })
  })
})
