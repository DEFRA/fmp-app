const { mockEsriRequest, stopMockingEsriRequests, mockEsriRequestWithThrow } = require('../../__tests__/__mocks__/agol')
const { getCustomerTeam } = require('../getCustomerTeam')

describe('getCustomerTeam', () => {
  beforeEach(async () => {
    mockEsriRequest([{
      attributes: {
        contact_email: 'neyorkshire@environment-agency.gov.uk',
        area_name_1: 'Environment Agency team in Yorkshire',
        use_automated_service: true
      }
    }])
  })

  afterEach(async () => {
    stopMockingEsriRequests()
  })

  it('should assign values as expected', async () => {
    const response = await getCustomerTeam({})
    expect(response).toEqual({
      isEngland: true,
      EmailAddress: 'neyorkshire@environment-agency.gov.uk',
      AreaName: 'Environment Agency team in Yorkshire',
      useAutomatedService: true
    })
  })

  it('should throw if EsriRequest throws', async () => {
    mockEsriRequestWithThrow()
    try {
      await getCustomerTeam({})
    } catch (error) {
      expect(error.message).toEqual('mocked error')
    }
  })

  it('should throw if EsriRequest is invalid', async () => {
    mockEsriRequest('NOT AN ARRAY')
    try {
      await getCustomerTeam({})
    } catch (error) {
      expect(error.message).toEqual('Invalid response from AGOL customerTeam request')
    }
  })
})
