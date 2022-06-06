const Lab = require('@hapi/lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const { emailConfirmation } = require('../../server/services/email-confirmation')
const Wreck = require('@hapi/wreck')
const config = require('../../config')

lab.experiment('email-confirmation', () => {
  let restoreWreckPost
  const fullname = 'Joe Bloggs'
  const referencenumber = '1234'
  const location = '123,456'
  const areaname = 'pickering'
  const psoemailaddress = 'pso@example.com'
  const recipientemail = 'joeBloggs@example.com'
  const search = '123,456'
  const zoneNumber = '1'

  lab.before(async () => {
    restoreWreckPost = Wreck.post
    Wreck.post = (url, data) => ({ url, data })
  })

  lab.after(async () => {
    Wreck.post = restoreWreckPost
  })

  lab.test('emailConfirmation should throw an exception if location is not set', async () => {
    try {
      await emailConfirmation(fullname, referencenumber, undefined, areaname, psoemailaddress, recipientemail, search, zoneNumber)
    } catch (err) {
      Code.expect(err.message).to.equal('Failed to send email')
    }
  })

  lab.test('emailConfirmation should post to config.functionAppUrl/email/confirmation if data passed is valid', async () => {
    Wreck.post = (url, data) => {
      try {
        Code.expect(url).to.equal(config.functionAppUrl + '/email/confirmation')
        Code.expect(data).to.equal({
          payload: '{"fullname":"Joe Bloggs","referencenumber":"1234","areaname":"pickering","psoemailaddress":"pso@example.com","recipientemail":"joeBloggs@example.com","location":"123,456","search":"123,456"}'
        })
      } catch (assertError) {
        console.log('assertError failed', assertError)
        throw assertError
      }
    }
    try {
      await emailConfirmation(fullname, referencenumber, location, areaname, psoemailaddress, recipientemail, search)
    } catch (err) {
      // This is a dummy catch - if any of the asserts in the mocked Wreck.post above fail, then emailConfirmation
      // will throw the error 'Failed to send email
      // The console.log in the catch block above should contain the details of the actual assertion failure
      Code.expect(err).to.equal(undefined)
    }
  })
})
