const Lab = require('@hapi/lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const { method: getPsoContacts } = require('../../server/services/pso-contact')
const Wreck = require('@hapi/wreck')
const config = require('../../config')

lab.experiment('pso-contact', () => {
  let restoreWreckPost

  lab.before(async () => {
    restoreWreckPost = Wreck.post
    Wreck.post = (url, data) => ({ url, data })
  })

  lab.after(async () => {
    Wreck.post = restoreWreckPost
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
    Wreck.post = (url, data) => {
      try {
        const { payload } = data
        Code.expect(url).to.equal(config.functionAppUrl + '/pso/contacts')
        Code.expect(payload).to.equal('{"x":10000,"y":20000}')
        return { payload }
      } catch (assertError) {
        console.log('assertError failed', assertError)
        throw assertError
      }
    }
    try {
      await getPsoContacts(10000, 20000)
    } catch (err) {
      // This is a dummy catch - if any of the asserts in the mocked Wreck.post above fail, then getPsoContacts
      // will throw the error 'Fetching Pso contacts failed: '
      // The console.log in the catch block above should contain the details of the actual assertion failure
      Code.expect(err).to.equal(undefined)
    }
  })
})
