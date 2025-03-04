const { mockEsriRequest, stopMockingEsriRequests } = require('./__mocks__/agol')

describe('pso-contact', () => {
  let getPsoContacts
  beforeEach(async () => {
    mockEsriRequest([{
      attributes: {
        ons_name: 'Ryedale',
        contact_email: 'neyorkshire@environment-agency.gov.uk',
        area_name_1: 'Environment Agency team in Yorkshire',
        use_automated_service: true
      }
    }])
    const { method: _getPsoContacts } = require('../../services/pso-contact')
    getPsoContacts = _getPsoContacts
  })

  afterAll(async () => {
    stopMockingEsriRequests()
  })

  it('getPsoContacts should throw an exception if easting and northing are not set', async () => {
    try {
      await getPsoContacts()
    } catch (err) {
      expect(err.message).toEqual('Fetching Pso contacts failed: ')
    }
  })

  it('getPsoContacts should throw an exception if easting is not set', async () => {
    try {
      await getPsoContacts(undefined, 10000)
    } catch (err) {
      expect(err.message).toEqual('Fetching Pso contacts failed: ')
    }
  })

  it('getPsoContacts should throw an exception if northing is not set', async () => {
    try {
      await getPsoContacts(10000)
    } catch (err) {
      expect(err.message).toEqual('Fetching Pso contacts failed: ')
    }
  })

  it('getPsoContacts should return expected results', async () => {
    try {
      const psoContactDetails = await getPsoContacts(10000, 20000)
      expect(psoContactDetails).toEqual({
        isEngland: true,
        EmailAddress: 'neyorkshire@environment-agency.gov.uk',
        AreaName: 'Environment Agency team in Yorkshire',
        LocalAuthorities: 'Ryedale',
        useAutomatedService: true
      })
    } catch (err) {
      // This is a dummy catch - if any of the asserts in the mocked util.getJson above fail, then getPsoContacts
      // will throw the error 'Fetching Pso contacts failed: '
      // The console.log in the catch block above should contain the details of the actual assertion failure
      expect(err).toEqual(undefined)
    }
  })
})
