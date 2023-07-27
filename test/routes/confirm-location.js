const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const headers = require('../models/page-headers')
const isEnglandService = require('../../server/services/is-england')
const createServer = require('../../server')
const { payloadMatchTest } = require('../utils')
const { JSDOM } = require('jsdom')

lab.experiment('confirm-location', () => {
  let server
  let restoreIsEnglandService
  let restoreGetPsoContacts
  let restoreGetPsoContactsByPolygon
  const validPsoContactReponse = {
    EmailAddress: 'psoContact@example.com',
    AreaName: 'Yorkshire',
    LocalAuthorities: 'Ryedale',
    useAutomatedService: true
  }
  const inValidPsoContactReponse = [{
    EmailAddress: null,
    AreaName: 'Yorkshire',
    LocalAuthorities: 'Ryedale',
    useAutomatedService: true
  }, {
    EmailAddress: 'psoContact@example.com',
    AreaName: null,
    LocalAuthorities: 'Ryedale',
    useAutomatedService: true
  }, {
    EmailAddress: 'psoContact@example.com',
    AreaName: 'Yorkshire',
    LocalAuthorities: null,
    useAutomatedService: true
  }
  ]
  lab.before(async () => {
    server = await createServer()
    await server.initialize()
    restoreIsEnglandService = isEnglandService.get
    restoreGetPsoContacts = server.methods.getPsoContacts
    restoreGetPsoContactsByPolygon = server.methods.getPsoContactsByPolygon
    server.methods.getPsoContacts = () => validPsoContactReponse
    server.methods.getPsoContactsByPolygon = server.methods.getPsoContacts
    isEnglandService.get = async (x, y) => {
      return { is_england: true }
    }
  })

  lab.after(async () => {
    await server.stop()
    isEnglandService.get = restoreIsEnglandService
    server.methods.getPsoContacts = restoreGetPsoContacts
    server.methods.getPsoContactsByPolygon = restoreGetPsoContactsByPolygon
  })

  const assertContactEnvironmentAgencyText = async response => {
    const { payload } = response
    const { window: { document: doc } } = await new JSDOM(payload)
    const div = doc.querySelectorAll('[data-pso-contact-email]')
    Code.expect(div.length).to.equal(1) // check for a single data-pso-contact-email div
    Code.expect(div[0].textContent).to.contain('Contact the Environment Agency team in Yorkshire at')
  }

  lab.test('confirm-location with easting & northing', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?easting=360799&northing=388244'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers['confirm-location'].standard)
    await assertContactEnvironmentAgencyText(response)
  })

  lab.test('confirm-location with easting only', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?easting=360799'
    }
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
  })

  lab.test('confirm-location with northing only', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?northing=388244'
    }
    const response = await server.inject(options)
    const { headers } = response
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(headers.location).to.equal('/')
  })

  lab.test('confirm-location with invalid query expect redirect', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
  })

  lab.test('confirm-location with unknown parameter to return 400 page', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?thing=jksgfdjs'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
  })

  lab.test('confirm-location returns not in england redirection by E/N', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?easting=259309&northing=672290'
    }

    isEnglandService.get = async (x, y) => {
      return { is_england: false }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(response.headers.location).to.equal('/england-only?easting=259309&northing=672290')
  })

  lab.test('confirm-location returns not in england with place and postcode', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?placeOrPostcode=Newport&easting=333433&northing=186528'
    }

    isEnglandService.get = async (x, y) => {
      return { is_england: false }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(response.headers.location).to.equal('/england-only?placeOrPostcode=Newport&easting=333433&northing=186528')
  })

  lab.test('confirm-location returns not in england with NGR ST180772', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?nationalGridReference=ST180772&easting=31800&northing=177200'
    }

    isEnglandService.get = async (x, y) => {
      return { is_england: false }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(response.headers.location).to.equal('/england-only?nationalGridReference=ST180772&easting=31800&northing=177200')
  })
  inValidPsoContactReponse.forEach((invalidResponse) => {
    lab.test('an invalid psoContactResponse should redirect to england-only', async () => {
      const polygon = '[[479472,484194],[479467,484032],[479678,484015],[479691,484176],[479472,484194]]'
      const options = {
        method: 'GET',
        url: `/confirm-location?easting=333433&northing=186528&polygon=${polygon}`
      }
      const restoreGetPsoContactsByPolygon = server.methods.getPsoContactsByPolygon
      server.methods.getPsoContactsByPolygon = () => invalidResponse
      const response = await server.inject(options)
      Code.expect(response.statusCode).to.equal(302)
      Code.expect(response.headers.location).to.equal(`/england-only?easting=333433&northing=186528&polygon=${encodeURIComponent(polygon)}`)
      server.methods.getPsoContactsByPolygon = restoreGetPsoContactsByPolygon
    })
  })

  lab.test('isEngland Errors', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?easting=360799&northing=388244'
    }

    isEnglandService.get = async (x, y) => {
      throw new Error('is england error')
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(500)
  })

  lab.test('confirm-location should throw an exception if isEnglandService returns false', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?easting=360799&northing=388244'
    }

    isEnglandService.get = async (x, y) => {
      return false
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(500)
  })

  lab.test('confirm-location view should contain location=placeOrPostcode if placeOrPostcode is set', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?placeOrPostcode=Newport&easting=333433&northing=186528'
    }

    isEnglandService.get = async (x, y) => {
      return { is_england: true }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)

    // Check that location=Newport is included in the flood-zone-results url
    const { result } = response
    const matchResults = result.match(/flood-zone-results\?easting=333433&amp;northing=186528&amp;location=Newport/g)
    Code.expect(matchResults.length).to.equal(1)
  })

  lab.test('confirm-location view should contain location=nationalGridReference if nationalGridReference is set', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?nationalGridReference=ST180772&easting=333433&northing=186528'
    }

    isEnglandService.get = async (x, y) => {
      return { is_england: true }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)

    // Check that location=ST180772 is included in the flood-zone-results url
    const { result } = response
    const matchResults = result.match(/flood-zone-results\?easting=333433&amp;northing=186528&amp;location=ST180772/g)
    Code.expect(matchResults.length).to.equal(1)
    await assertContactEnvironmentAgencyText(response)
  })

  lab.test('confirm-location view should accept polygon', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?easting=333433&northing=186528&polygon=[[479472,484194],[479467,484032],[479678,484015],[479691,484176],[479472,484194]]'
    }

    isEnglandService.get = async (x, y) => {
      return { is_england: true }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)

    const { result } = response
    const matchResults = result.match(/flood-zone-results\?easting=333433&amp;northing=186528&amp;.*/g)
    Code.expect(matchResults.length).to.equal(1)
    await assertContactEnvironmentAgencyText(response)
  })

  lab.test('confirm-location view with invalid polygon should redirect to /', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?fullName=joe%20bloggs&easting=333433&northing=186528&polygon=notarray'
    }

    isEnglandService.get = async (x, y) => {
      return { is_england: true }
    }
    const { headers, statusCode } = await server.inject(options)
    Code.expect(statusCode).to.equal(302)
    Code.expect(headers.location).to.equal('/')
  })

  const assertErrorMessage = async (payload, errorMessageExpected = true) => {
    await payloadMatchTest(payload,
      /<h2 class="govuk-error-summary__title">[\s\S]*There is a problem[\s\S]*<\/h2>/g,
      errorMessageExpected ? 1 : 0)

    // Error Title Should only be displayed if polygonMissing is true
    await payloadMatchTest(payload,
      /<title>[\s\S]*Error: Draw the boundary of your site - Flood map for planning - GOV.UK[\s\S]*<\/title>/g,
      errorMessageExpected ? 1 : 0)

    // This should always pass (the regex matches regardless of the presence of "Error: ")
    await payloadMatchTest(payload,
      /<title>[\s\S]*Draw the boundary of your site - Flood map for planning - GOV.UK[\s\S]*<\/title>/g,
      1)
  }

  lab.test('confirm-location view should not show an error if polygonMissing=true is not passed', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?easting=479472&northing=484194&placeOrPostcode=Pickering&recipientemail=joe@example.com'
    }

    isEnglandService.get = async (x, y) => {
      return { is_england: true }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)

    const { payload } = response
    await payloadMatchTest(payload, /<p class="govuk-body">You need to draw the boundary of your site on the map below so we can give you accurate flood risk information.<\/p>/g)
    assertErrorMessage(payload, false)
    await assertContactEnvironmentAgencyText(response)
  })

  lab.test('confirm-location view should show an error if polygonMissing=true is passed', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?easting=479472&northing=484194&placeOrPostcode=Pickering&recipientemail=joe@example.com&polygonMissing=true'
    }

    isEnglandService.get = async (x, y) => {
      return { is_england: true }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)

    const { payload } = response
    await payloadMatchTest(payload, /<p class="govuk-body">You need to draw the boundary of your site on the map below so we can give you accurate flood risk information.<\/p>/g)
    assertErrorMessage(payload, true)
    await assertContactEnvironmentAgencyText(response)
  })
})
