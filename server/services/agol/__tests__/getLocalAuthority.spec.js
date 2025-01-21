const { mockEsriRequest, stopMockingEsriRequests } = require('../../__tests__/__mocks__/agol')
const { getLocalAuthority } = require('../getLocalAuthority')

describe('getLocalAuthority', () => {
  beforeEach(async () => {
    mockEsriRequest([{
      attributes: {
        authority_name: 'Ryedale'
      }
    }])
  })

  afterEach(async () => {
    stopMockingEsriRequests()
  })

  it('should assign values as expected', async () => {
    const response = await getLocalAuthority({})
    expect(response).toEqual({ LocalAuthorities: 'Ryedale' })
  })
})
