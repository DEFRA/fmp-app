const Lab = require('@hapi/lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const createServer = require('../../server')
const psoContactDetails = require('../../server/services/pso-contact')
const riskService = require('../../server/services/risk')
const { payloadMatchTest } = require('../utils')
const isEnglandService = require('../../server/services/is-england')

lab.experiment('flood-zone-results', () => {
  let server
  let restoreGetPsoContacts
  let restoreGetByPolygon
  let restoreGetByPoint
  let restoreIsEnglandService
  let restoreIgnoreUseAutomatedService

  const urlByPolygon = '/flood-zone-results?location=Pickering&fullName=Joe%20Bloggs&recipientemail=joe@example.com&polygon=[[479472,484194],[479467,484032],[479678,484015],[479691,484176],[479472,484194]]&center=[479472,484194]'

  lab.before(async () => {
    restoreGetPsoContacts = psoContactDetails.getPsoContacts
    restoreGetByPolygon = riskService.getByPolygon
    restoreGetByPoint = riskService.getByPoint
    restoreIgnoreUseAutomatedService = psoContactDetails.ignoreUseAutomatedService
    psoContactDetails.getPsoContacts = () => ({
      EmailAddress: 'psoContact@example.com',
      AreaName: 'Yorkshire',
      useAutomatedService: true
    })

    riskService.getByPolygon = () => ({ in_england: true })
    riskService.getByPoint = () => ({ point_in_england: true })

    restoreIsEnglandService = isEnglandService.get
    isEnglandService.get = async (x, y) => {
      return { is_england: true }
    }

    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    psoContactDetails.getPsoContacts = restoreGetPsoContacts
    riskService.getByPolygon = restoreGetByPolygon
    riskService.getByPoint = restoreGetByPoint
    isEnglandService.get = restoreIsEnglandService
    psoContactDetails.ignoreUseAutomatedService = restoreIgnoreUseAutomatedService
    await server.stop()
  })

  lab.test('get flood-zone-results with valid easting & northing parameters should succeed', async () => {
    const options = {
      method: 'GET',
      url: urlByPolygon
    }
    const response = await server.inject(options)
    const { payload } = response
    Code.expect(response.statusCode).to.equal(200)
    await payloadMatchTest(payload, /<p class="govuk-body">Contact the Yorkshire at <a/g)
    // FCRM 3594
    await payloadMatchTest(payload, /<figcaption class="govuk-visually-hidden" aria-hidden="false">[\s\S]*[ ]{1}A map showing the flood risk for the location you have provided[\s\S]*<\/figcaption>/g, 1)
    await payloadMatchTest(payload, /<h3 class="govuk-heading-s">More help and advice<\/h3>/g, 0)
    await payloadMatchTest(payload, /<h2 class="govuk-heading-s">More help and advice<\/h2>/g, 1)
    await payloadMatchTest(payload, /<h3 class="govuk-heading-s">Change location<\/h3>/g, 0)
    await payloadMatchTest(payload, /<h2 class="govuk-heading-s">Change location<\/h2>/g, 1)
    await payloadMatchTest(payload, /We recommend that you check the relevant local planning authority's strategic flood risk assessment \(SFRA\)/g)
  })

  const testIfP4DownloadButtonExists = async (payload, shouldExist = true) => {
    // Test that the Request flood risk assessment data heading is present
    await payloadMatchTest(payload, /<h2 class="govuk-heading-m">Request flood risk assessment data<\/h2>/g, shouldExist ? 0 : 1)
    await payloadMatchTest(payload, /<p class="govuk-heading-m">Request flood risk assessment data<\/p>/g, 0) // should never exist

    // Test that the 'Request your flood risk assessment data' button is present
    await payloadMatchTest(payload, /Request your flood risk assessment data/g, shouldExist ? 1 : 0)
  }

  lab.test('get flood-zone-results request data button should be hidden if useAutomated is false', async () => {
    const options = { method: 'GET', url: urlByPolygon }
    psoContactDetails.getPsoContacts = () => ({
      EmailAddress: 'psoContact@example.com',
      AreaName: 'Yorkshire',
      useAutomatedService: false
    })
    psoContactDetails.ignoreUseAutomatedService = () => false
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    const { payload } = response
    testIfP4DownloadButtonExists(payload, false)
  })

  lab.test('get flood-zone-results request data button should be present if useAutomated is true', async () => {
    const options = { method: 'GET', url: urlByPolygon }
    psoContactDetails.getPsoContacts = () => ({
      EmailAddress: 'psoContact@example.com',
      AreaName: 'Yorkshire',
      useAutomatedService: true
    })
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    const { payload } = response
    testIfP4DownloadButtonExists(payload, true)
  })

  lab.test('get flood-zone-results request data button should be present if useAutomated is false and config.ignoreUseAutomatedService is true', async () => {
    const options = { method: 'GET', url: urlByPolygon }
    psoContactDetails.getPsoContacts = () => ({
      EmailAddress: 'psoContact@example.com',
      AreaName: 'Yorkshire',
      useAutomatedService: false
    })
    psoContactDetails.ignoreUseAutomatedService = () => true
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    const { payload } = response
    testIfP4DownloadButtonExists(payload, true)
  })

  // Test all iterations of psoContactResponse to get full coverage
  const psoContactResponses = [
    ['a full psoContactResponse', { EmailAddress: 'psoContact@example.com', AreaName: 'Yorkshire' }],
    ['areaName only in psoContactResponse', { AreaName: 'Yorkshire' }],
    ['emailAddress only in psoContactResponse', { EmailAddress: 'psoContact@example.com' }],
    ['an undefined psoContactResponse', undefined]
  ]
  psoContactResponses.forEach(([psoContactDescription, psoContactResponse]) => {
    lab.test(`get flood-zone-results with valid polygon parameters and ${psoContactDescription} should succeed`, async () => {
      const options = {
        method: 'GET',
        url: urlByPolygon
      }
      psoContactDetails.getPsoContacts = () => psoContactResponse

      const response = await server.inject(options)
      const { payload } = response

      Code.expect(response.statusCode).to.equal(200)
      const { AreaName = '' } = (psoContactResponse || {})
      const regex = new RegExp(String.raw`<p class="govuk-body">Contact the ${AreaName} at <a`)
      await payloadMatchTest(payload, regex)
    })
  })

  lab.test('get flood-zone-results with a non england result should redirect to /england-only', async () => {
    const options = { method: 'GET', url: urlByPolygon }
    psoContactDetails.getPsoContacts = () => ({ EmailAddress: 'psoContact@example.com', AreaName: 'Yorkshire' })
    riskService.getByPolygon = () => ({ in_england: false })
    riskService.getByPoint = () => ({ point_in_england: false })

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    const { headers } = response
    const expectedRedirectUrl = '/england-only?centroid=true&easting=479472&northing=484194'
    Code.expect(headers.location).to.equal(expectedRedirectUrl)
  })

  lab.test('get flood-zone-results should error if a library error occurs', async () => {
    const options = { method: 'GET', url: urlByPolygon }
    psoContactDetails.getPsoContacts = () => ({ EmailAddress: 'psoContact@example.com', AreaName: 'Yorkshire' })
    riskService.getByPolygon = () => { throw new Error('Deliberate Testing Error ') }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(500)
  })

  lab.test('get flood-zone-results with a non england result should redirect to /england-only', async () => {
    const url = '/flood-zone-results?center=[341638,352001]&location=Caldecott%2520Green&fullName=Mark&recipientemail=mark@example.com&polygon=[[479472,484194],[479467,484032],[479678,484015],[479691,484176],[479472,484194]]'
    console.log('url', url)
    const options = { method: 'GET', url }
    psoContactDetails.getPsoContacts = () => ({ EmailAddress: 'psoContact@example.com', AreaName: 'Yorkshire' })
    riskService.getByPolygon = () => ({ in_england: true })
    riskService.getByPoint = () => ({ point_in_england: true })
    isEnglandService.get = async () => ({ is_england: false })
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    const { headers } = response
    const expectedRedirectUrl = '/england-only?center=%5B341638%2C352001%5D&location=Caldecott%2520Green&fullName=Mark&recipientemail=mark%40example.com&polygon=%5B%5B479472%2C484194%5D%2C%5B479467%2C484032%5D%2C%5B479678%2C484015%5D%2C%5B479691%2C484176%5D%2C%5B479472%2C484194%5D%5D'
    Code.expect(headers.location).to.equal(expectedRedirectUrl)
  })

  lab.test('a flood-zone-results without a polygon should redirect back to /confirm-location', async () => {
    const url = '/flood-zone-results?easting=479472&northing=484194&location=Pickering&fullName=Joe%20Bloggs&recipientemail=joe@example.com'
    const options = { method: 'GET', url }
    isEnglandService.get = async () => ({ is_england: true })
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    const { headers } = response
    const expectedRedirectUrl = '/confirm-location?easting=479472&northing=484194&placeOrPostcode=Pickering&recipientemail=joe@example.com&polygonMissing=true'
    Code.expect(headers.location).to.equal(expectedRedirectUrl)
  })
})
