const Lab = require('@hapi/lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const createServer = require('../../server')
const emailConfirm = require('../../server/services/email-confirmation')
const psoContactDetails = require('../../server/services/pso-contact')
const { payloadMatchTest } = require('../utils')

const Wreck = require('@hapi/wreck')
const config = require('../../config')

lab.experiment('confirmation', () => {
  let server
  let restoreEmailConfirmation
  let restoreWreckPost
  let restoreGetPsoContacts

  lab.before(async () => {
    restoreEmailConfirmation = emailConfirm.emailConfirmation
    restoreWreckPost = Wreck.post
    restoreGetPsoContacts = psoContactDetails.getPsoContacts
    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    emailConfirm.emailConfirmation = restoreEmailConfirmation
    Wreck.post = restoreWreckPost
    psoContactDetails.getPsoContacts = restoreGetPsoContacts
    await server.stop()
  })

  const urls = [
    '/confirmation',
    '/confirmation?fullName=Joe%20Bloggs',
    '/confirmation?fullName=Joe%20Bloggs&recipientemail=joe@example.com',
    '/confirmation?fullName=Joe%20Bloggs&recipientemail=joe@example.com&applicationReferenceNumber=12345',
    '/confirmation?x=12345&y=67890&recipientemail=joe@example.com&applicationReferenceNumber=12345&location=Pickering'
  ]
  urls.forEach((url) => {
    lab.test('confirmation without query should throw an error ', async () => {
      const options = {
        method: 'GET',
        url
      }
      const response = await server.inject(options)
      Code.expect(response.statusCode).to.equal(500)
    })
  })

  // Test all iterations of psoContactResponse to get full coverage
  const psoContactResponses = [
    ['a full psoContactResponse', { EmailAddress: 'psoContact@example.com', AreaName: 'Yorkshire', LocalAuthorities: 'localAuth' }],
    ['areaName only in psoContactResponse', { AreaName: 'Yorkshire' }],
    ['emailAddress only in psoContactResponse', { EmailAddress: 'psoContact@example.com' }],
    ['an undefined psoContactResponse', undefined]
  ]
  psoContactResponses.forEach(([psoContactDescription, psoContactResponse]) => {
    const urls = [
      '/confirmation?x=12345&y=67890&fullName=Joe%20Bloggs&recipientemail=joe@example.com&applicationReferenceNumber=12345&location=Pickering',
      '/confirmation?x=12345&y=67890&fullName=Joe%20Bloggs&recipientemail=joe@example.com&applicationReferenceNumber=12345&location=Pickering&zoneNumber=10'
    ]
    urls.forEach((url) => {
      lab.test(`confirmation with a valid query should show the confirmation view and ${psoContactDescription}`, async () => {
        psoContactDetails.getPsoContacts = () => psoContactResponse
        let emailConfirmationUrl
        Wreck.post = async (url, data) => {
          emailConfirmationUrl = url
        }

        const options = { method: 'GET', url }
        const response = await server.inject(options)
        const { payload } = response
        Code.expect(emailConfirmationUrl).to.equal(config.functionAppUrl + '/email/confirmation')
        Code.expect(response.statusCode).to.equal(200)
        await payloadMatchTest(payload, /<a href="\/flood-zone-results\?easting=12345&northing=67890&location=12345,67890">Go back to your flood information<\/a>/g)
      })
    })
  })

  lab.test('confirmation should return internalServerError if an error is thrown', async () => {
    psoContactDetails.getPsoContacts = () => { throw new Error('test error') }
    const options = { method: 'GET', url: '/confirmation?x=12345&y=67890&fullName=Joe%20Bloggs&recipientemail=joe@example.com&applicationReferenceNumber=12345&location=Pickering&zoneNumber=10' }
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(500)
  })

  lab.test('confirmation with a polygon should contain a url to flood-zone-results with that polygon', async () => {
    psoContactDetails.getPsoContacts = () => ({ EmailAddress: 'psoContact@example.com', AreaName: 'Yorkshire', LocalAuthorities: 'localAuth' })
    const url = '/confirmation?fullName=JoeBloggs&polygon=%5B%5B479536%2C484410%5D%2C%5B479425%2C484191%5D%2C%5B479785%2C484020%5D%2C%5B479861%2C484314%5D%2C%5B479536%2C484410%5D%5D&recipientemail=Mark.Fee%40defra.gov.uk&applicationReferenceNumber=VNEFM46GF1CA&x=479643&y=484215&location=pickering&zoneNumber=3&cent=%5B479643%2C484215%5D'

    let emailConfirmationUrl
    Wreck.post = async (url, data) => {
      emailConfirmationUrl = url
    }

    const options = { method: 'GET', url }
    const response = await server.inject(options)
    const { payload } = response
    Code.expect(emailConfirmationUrl).to.equal(config.functionAppUrl + '/email/confirmation')
    Code.expect(response.statusCode).to.equal(200)
    await payloadMatchTest(payload, /<a href="\/flood-zone-results\?location=479643,484215&polygon=\[\[479536,484410\],\[479425,484191\],\[479785,484020\],\[479861,484314\],\[479536,484410\]\]&center=\[479643,484215\]">Go back to your flood information<\/a>/g)
  })
})
