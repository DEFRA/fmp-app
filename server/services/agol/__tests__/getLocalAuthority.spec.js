const { mockEsriRequest, mockEsriRequestWithThrow, stopMockingEsriRequests } = require('../../__tests__/__mocks__/agol')
const { getLocalAuthority } = require('../getLocalAuthority')

describe('getLocalAuthority', () => {
  beforeEach(async () => {
    mockEsriRequest([{ attributes: { ons_name: 'Ryedale' } }])
  })

  afterEach(stopMockingEsriRequests)

  it('should assign values as expected', async () => {
    const response = await getLocalAuthority({})
    expect(response).toEqual({ LocalAuthorities: 'Ryedale' })
  })

  it('should return with LocalAuthorities undefined if no results', async () => {
    mockEsriRequest([])
    const response = await getLocalAuthority({})
    expect(response).toEqual({ LocalAuthorities: undefined })
  })

  it('should throw if EsriRequest throws', async () => {
    mockEsriRequestWithThrow()
    try {
      await getLocalAuthority({})
    } catch (error) {
      expect(error.message).toEqual('mocked error')
    }
  })

  it('should throw if EsriRequest is invalid', async () => {
    mockEsriRequest('NOT AN ARRAY')
    try {
      await getLocalAuthority({})
    } catch (error) {
      expect(error.message).toEqual('Invalid response from AGOL localAuthority request')
    }
  })
})
