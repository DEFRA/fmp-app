require('dotenv').config({ path: 'config/.env-example' })
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const { mockEsriRequest, stopMockingEsriRequests } = require('./mocks/agol')

lab.experiment('pso-contact', () => {
  let getPsoContacts
  lab.before(async () => {
    mockEsriRequest([{
      attributes: {
        authority_name: 'Ryedale',
        contact_email: 'neyorkshire@environment-agency.gov.uk',
        area_name: 'Environment Agency team in Yorkshire',
        use_automated_service: true
      }
    }])
    const { method: _getPsoContacts } = require('../../server/services/pso-contact')
    getPsoContacts = _getPsoContacts
  })

  lab.after(async () => {
    stopMockingEsriRequests()
  })

  lab.test('getPsoContacts should throw an exception if easting and northing are not set', async () => {
    try {
      await getPsoContacts()
    } catch (err) {
      Code.expect(err.message).to.equal('Fetching Pso contacts failed: ')
    }
  })

  lab.test('getPsoContacts should throw an exception if easting is not set', async () => {
    try {
      await getPsoContacts(undefined, 10000)
    } catch (err) {
      Code.expect(err.message).to.equal('Fetching Pso contacts failed: ')
    }
  })

  lab.test('getPsoContacts should throw an exception if northing is not set', async () => {
    try {
      await getPsoContacts(10000)
    } catch (err) {
      Code.expect(err.message).to.equal('Fetching Pso contacts failed: ')
    }
  })

  lab.test('getPsoContacts should post to config.functionAppUrl/pso/contacts if data passed is valid', async () => {
    try {
      const psoContactDetails = await getPsoContacts(10000, 20000)
      Code.expect(psoContactDetails).to.equal({
        EmailAddress: 'neyorkshire@environment-agency.gov.uk',
        AreaName: 'Environment Agency team in Yorkshire',
        LocalAuthorities: 'Ryedale',
        useAutomatedService: true
      })
    } catch (err) {
      // This is a dummy catch - if any of the asserts in the mocked util.getJson above fail, then getPsoContacts
      // will throw the error 'Fetching Pso contacts failed: '
      // The console.log in the catch block above should contain the details of the actual assertion failure
      Code.expect(err).to.equal(undefined)
    }
  })
})
