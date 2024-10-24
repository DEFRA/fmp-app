const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const createServer = require('../../server')
const { payloadMatchTest } = require('../utils')
const { JSDOM } = require('jsdom')
require('dotenv').config()

lab.experiment('confirmation', () => {
  let server
  let restoreGetPsoContacts

  const LocalAuthorities = 'Ryedale'

  lab.before(async () => {
    server = await createServer()
    await server.initialize()
    restoreGetPsoContacts = server.methods.getPsoContactsByPolygon
  })

  lab.after(async () => {
    server.methods.getPsoContactsByPolygon = restoreGetPsoContacts
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

  const assertContactEnvironmentAgencyText = async (
    response,
    AreaName,
    LocalAuthority
  ) => {
    const { payload } = response
    const {
      window: { document: doc }
    } = await new JSDOM(payload)
    const contactEmailDiv = doc.querySelectorAll('[data-pso-contact-email]')
    Code.expect(contactEmailDiv.length).to.equal(1) // check for a single data-pso-contact-email div
    Code.expect(contactEmailDiv[0].textContent).to.contain(
      `Contact the Environment Agency team in ${AreaName} at`
    )

    const speakToLocalAuthListItem = doc.querySelectorAll(
      '[data-local-authority]'
    )
    Code.expect(speakToLocalAuthListItem.length).to.equal(1)
    const expectedLocalAuthorityText = LocalAuthority
      ? `, ${LocalAuthority}`
      : ''
    Code.expect(speakToLocalAuthListItem[0].textContent).to.contain(
      `speak to your local authority${expectedLocalAuthorityText}`
    )
  }

  // Test all iterations of psoContactResponse to get full coverage
  const psoContactResponses = [
    [
      'a full psoContactResponse',
      {
        EmailAddress: 'psoContact@example.com',
        AreaName: 'Yorkshire',
        LocalAuthorities
      }
    ],
    [
      'areaName only in psoContactResponse',
      { AreaName: 'Yorkshire', LocalAuthorities }
    ],
    [
      'emailAddress only in psoContactResponse',
      { EmailAddress: 'psoContact@example.com', LocalAuthorities }
    ],
    ['an undefined psoContactResponse', undefined]
  ]
  psoContactResponses.forEach(([psoContactDescription, psoContactResponse]) => {
    const urls = [
      '/confirmation?x=12345&y=67890&fullName=Joe%20Bloggs&recipientemail=joe@example.com&applicationReferenceNumber=12345&location=Pickering',
      '/confirmation?x=12345&y=67890&fullName=Joe%20Bloggs&recipientemail=joe@example.com&applicationReferenceNumber=12345&location=Pickering&zoneNumber=10'
    ]
    urls.forEach((url) => {
      lab.test(
        `confirmation with a valid query should show the confirmation view and ${psoContactDescription}`,
        async () => {
          server.methods.getPsoContactsByPolygon = () => psoContactResponse

          const options = { method: 'GET', url }
          const response = await server.inject(options)
          Code.expect(response.statusCode).to.equal(200)
          const { AreaName = '', LocalAuthorities } = psoContactResponse || {}
          await assertContactEnvironmentAgencyText(
            response,
            AreaName,
            LocalAuthorities
          )
          await assertContactEnvironmentAgencyText(
            response,
            AreaName,
            LocalAuthorities
          )
        }
      )
    })
  })

  lab.test(
    'confirmation should return internalServerError if an error is thrown',
    async () => {
      server.methods.getPsoContactsByPolygon = () => {
        throw new Error('test error')
      }
      const options = {
        method: 'GET',
        url: '/confirmation?x=12345&y=67890&fullName=Joe%20Bloggs&recipientemail=joe@example.com&applicationReferenceNumber=12345&location=Pickering&zoneNumber=10'
      }
      const response = await server.inject(options)
      Code.expect(response.statusCode).to.equal(500)
    }
  )

  lab.test(
    'confirmation with a polygon should contain a url to flood-zone-results with that polygon',
    async () => {
      server.methods.getPsoContactsByPolygon = () => ({
        EmailAddress: 'psoContact@example.com',
        AreaName: 'Yorkshire',
        LocalAuthorities
      })
      const url =
        '/confirmation?fullName=JoeBloggs&polygon=%5B%5B479536%2C484410%5D%2C%5B479425%2C484191%5D%2C%5B479785%2C484020%5D%2C%5B479861%2C484314%5D%2C%5B479536%2C484410%5D%5D&recipientemail=Mark.Fee%40defra.gov.uk&applicationReferenceNumber=VNEFM46GF1CA&x=479643&y=484215&location=pickering&zoneNumber=3&cent=%5B479643%2C484215%5D'

      const options = { method: 'GET', url }
      const response = await server.inject(options)
      Code.expect(response.statusCode).to.equal(200)
    }
  )

  const assertZone1SpecificText = async (response, isZone1 = true) => {
    const { payload } = response
    Code.expect(response.statusCode).to.equal(200)
    const zone1OnlyCount = isZone1 ? 1 : 0
    const notZone1Count = isZone1 ? 0 : 1

    // NOT SHOWN FOR ZONE 1
    await payloadMatchTest(
      payload,
      /<p class="govuk-body">We have sent a confirmation email to joe@example.com<\/p>/g,
      notZone1Count
    )
    await payloadMatchTest(
      payload,
      /<p class="govuk-body">Otherwise, you should recieve your data within 20 working days.<\/p>/g,
      zone1OnlyCount
    )
  }

  lab.test(
    'confirmation page in zone 1 should show specific zone 1 text',
    async () => {
      server.methods.getPsoContactsByPolygon = () => ({
        EmailAddress: 'psoContact@example.com',
        AreaName: 'Yorkshire',
        LocalAuthorities
      })

      const options = {
        method: 'GET',
        url: '/confirmation?x=12345&y=67890&fullName=Joe%20Bloggs&recipientemail=joe@example.com&applicationReferenceNumber=12345&location=Pickering&zoneNumber=1'
      }
      const response = await server.inject(options)
      assertZone1SpecificText(response, true)
    }
  )

  const zoneNumbers = [
    undefined,
    '2',
    '3',
    '3 in an area benefitting from flood defences',
    'not available'
  ]
  zoneNumbers.forEach((zoneNumber) => {
    lab.test(
      `confirmation page NOT in zone 1 (zone ${zoneNumber}) should NOT show specific zone 1 text`,
      async () => {
        server.methods.getPsoContactsByPolygon = () => ({
          EmailAddress: 'psoContact@example.com',
          AreaName: 'Yorkshire',
          LocalAuthorities
        })

        const options = {
          method: 'GET',
          url: `/confirmation?x=12345&y=67890&fullName=Joe%20Bloggs&recipientemail=joe@example.com&applicationReferenceNumber=12345&location=Pickering&zoneNumber=${zoneNumber}`
        }
        const response = await server.inject(options)
        assertZone1SpecificText(response, false)
      }
    )
  })
})
