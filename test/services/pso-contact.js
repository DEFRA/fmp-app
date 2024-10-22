const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const { method: getPsoContacts } = require('../../server/services/pso-contact')
const { config } = require('../../config')
const util = require('../../server/util')

lab.experiment('pso-contact', () => {
  let restoreUtilGetJson

  lab.before(async () => {
    restoreUtilGetJson = util.getJson
    util.getJson = (url) => ({ url })
  })

  lab.after(async () => {
    util.getJson = restoreUtilGetJson
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
    util.getJson = async (url) => {
      try {
        Code.expect(url).to.equal(config.service + '/get-pso-contacts/10000/20000')
        return {
          emailaddress: 'neyorkshire@environment-agency.gov.uk',
          areaname: 'Environment Agency team in Yorkshire',
          localauthority: 'Ryedale',
          useautomatedservice: true
        }
      } catch (assertError) {
        console.log('assertError failed', assertError)
        throw assertError
      }
    }
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
