const Lab = require('@hapi/lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const createServer = require('../../server')
const riskService = require('../../server/services/risk')
const { payloadMatchTest } = require('../utils')
const FloodRiskView = require('../../server/models/flood-risk-view')
const sinon = require('sinon')
const { JSDOM } = require('jsdom')

lab.experiment('flood-zone-results', () => {
  let server
  let restoreGetPsoContactsByPolygon
  let restoreGetByPolygon
  let restoreIgnoreUseAutomatedService
  const LocalAuthorities = 'Ryedale'

  const optInPSOContactResponse = {
    EmailAddress: 'psoContact@example.com',
    AreaName: 'Yorkshire',
    useAutomatedService: true,
    LocalAuthorities
  }

  const optOutPSOContactResponse = {
    EmailAddress: 'psoContact@example.com',
    AreaName: 'Yorkshire',
    useAutomatedService: false,
    LocalAuthorities
  }

  const fzrUrlPolygon = '[[479472,484194],[479467,484032],[479678,484015],[479691,484176],[479472,484194]]'
  const fzrUrl = `/flood-zone-results?location=Pickering&polygon=${fzrUrlPolygon}&center=[479472,484194]`

  const zone1GetByPolygonResponse = {
    in_england: true,
    england_error: false,
    floodzone_3: false,
    floodzone_3_error: false,
    reduction_in_rofrs: false,
    reduction_in_rofrs_error: false,
    floodzone_2: false,
    floodzone_2_error: false
  }

  const zone2GetByPolygonResponse = Object.assign({},
    zone1GetByPolygonResponse, {
      floodzone_2: true
    })

  const zone3GetByPolygonResponse = Object.assign({},
    zone1GetByPolygonResponse, {
      floodzone_3: true,
      floodzone_2: true
    })

  const zone3WithDefenceGetByPolygonResponse = Object.assign({},
    zone3GetByPolygonResponse, {
      reduction_in_rofrs: true
    })

  lab.before(async () => {
    restoreGetByPolygon = riskService.getByPolygon

    riskService.getByPolygon = () => ({ in_england: true })

    server = await createServer()
    await server.initialize()
    restoreIgnoreUseAutomatedService = server.methods.ignoreUseAutomatedService
    restoreGetPsoContactsByPolygon = server.methods.getPsoContactsByPolygon
    server.methods.getPsoContactsByPolygon = async () => optInPSOContactResponse
  })

  lab.after(async () => {
    server.methods.getPsoContactsByPolygon = restoreGetPsoContactsByPolygon
    riskService.getByPolygon = restoreGetByPolygon
    server.methods.ignoreUseAutomatedService = restoreIgnoreUseAutomatedService
    await server.stop()
  })

  lab.test('get flood-zone-results with a valid polygon should succeed', async () => {
    const options = {
      method: 'GET',
      url: fzrUrl
    }

    server.methods.getPsoContactsByPolygon = async () => optInPSOContactResponse
    const response = await server.inject(options)
    const { payload } = response
    Code.expect(response.statusCode).to.equal(200)
    // FCRM 3594
    await payloadMatchTest(payload, /<figcaption class="govuk-visually-hidden" aria-hidden="false">[\s\S]*[ ]{1}A map showing the flood risk for the location you have provided[\s\S]*<\/figcaption>/g, 1)
  })

  lab.test('get flood-zone-results with a valid polygon should call buildFloodZoneResultsData', async () => {
    const options = {
      method: 'GET',
      url: fzrUrl
    }
    const FloodRiskViewModelSpy = sinon.spy(FloodRiskView, 'Model')

    server.methods.getPsoContactsByPolygon = async () => optInPSOContactResponse
    riskService.getByPolygon = () => zone1GetByPolygonResponse
    await server.inject(options)

    Code.expect(FloodRiskViewModelSpy.callCount).to.equal(1)
    Code.expect(FloodRiskViewModelSpy.args[0][0]).to.equal({
      areaName: 'Yorkshire',
      center: [479472, 484194],
      localAuthorities: 'Ryedale',
      location: 'Pickering',
      placeOrPostcode: undefined,
      polygon: [[479472, 484194], [479467, 484032], [479678, 484015], [479691, 484176], [479472, 484194]],
      psoEmailAddress: 'psoContact@example.com',
      risk: zone1GetByPolygonResponse,
      useAutomatedService: true,
      plotSize: '3.49'
    })
  })

  const testIfP4DownloadButtonExists = async (payload, shouldExist = true) => {
    // Test that the Request flood risk assessment data heading is present
    await payloadMatchTest(payload, /Order flood risk data for rivers and the sea/g, shouldExist ? 1 : 1)
    await payloadMatchTest(payload, /<p class="govuk-heading-m">Request flood risk assessment data<\/p>/g, 0) // should never exist

    // Test that the 'Request your flood risk assessment data' button is present
    await payloadMatchTest(payload, /Order flood risk data/g, shouldExist ? 2 : 1)
  }

  lab.test('get flood-zone-results request data button should be hidden if useAutomated is false', async () => {
    const options = { method: 'GET', url: fzrUrl }
    server.methods.getPsoContactsByPolygon = async () => optOutPSOContactResponse
    server.methods.ignoreUseAutomatedService = () => false
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    const { payload } = response
    await testIfP4DownloadButtonExists(payload, false)
  })

  lab.test('get flood-zone-results request data button should be present if useAutomated is true', async () => {
    const options = { method: 'GET', url: fzrUrl }
    server.methods.getPsoContactsByPolygon = async () => optInPSOContactResponse
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    const { payload } = response
    await testIfP4DownloadButtonExists(payload, true)
  })

  lab.test('get flood-zone-results request data button should be present if useAutomated is false and config.ignoreUseAutomatedService is true', async () => {
    const options = { method: 'GET', url: fzrUrl }
    server.methods.getPsoContactsByPolygon = async () => optOutPSOContactResponse
    server.methods.ignoreUseAutomatedService = () => true
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    const { payload } = response
    await testIfP4DownloadButtonExists(payload, true)
  })

  lab.test('get flood-zone-results with valid polygon parameters and psoContactResponse should succeed', async () => {
    const options = {
      method: 'GET',
      url: fzrUrl
    }
    server.methods.getPsoContactsByPolygon = async () => ({ EmailAddress: 'psoContact@example.com', AreaName: 'Yorkshire', LocalAuthorities })
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  const psoContactResponses = [
    ['areaName only in psoContactResponse', { AreaName: 'Yorkshire', LocalAuthorities }],
    ['emailAddress only in psoContactResponse', { EmailAddress: 'psoContact@example.com', LocalAuthorities }]
  ]
  psoContactResponses.forEach(([psoContactDescription, psoContactResponse]) => {
    lab.test(`get flood-zone-results with valid polygon parameters and psoContact response - ${psoContactDescription} - should redirect to /england-only`, async () => {
      const options = { method: 'GET', url: fzrUrl }
      server.methods.getPsoContactsByPolygon = async () => psoContactResponse
      const response = await server.inject(options)
      const { headers } = response
      const expectedRedirectUrl = '/england-only?location=Pickering&polygon=%5B%5B479472%2C484194%5D%2C%5B479467%2C484032%5D%2C%5B479678%2C484015%5D%2C%5B479691%2C484176%5D%2C%5B479472%2C484194%5D%5D&center=%5B479472%2C484194%5D'
      Code.expect(headers.location).to.equal(expectedRedirectUrl)
    })
  })

  lab.test('get flood-zone-results with a non england result should redirect to /england-only', async () => {
    const options = { method: 'GET', url: fzrUrl }
    server.methods.getPsoContactsByPolygon = async () => ({ EmailAddress: 'psoContact@example.com', AreaName: 'Yorkshire' })
    riskService.getByPolygon = () => ({ in_england: false })

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    const { headers } = response
    const expectedRedirectUrl = '/england-only?location=Pickering&polygon=%5B%5B479472%2C484194%5D%2C%5B479467%2C484032%5D%2C%5B479678%2C484015%5D%2C%5B479691%2C484176%5D%2C%5B479472%2C484194%5D%5D&center=%5B479472%2C484194%5D'
    Code.expect(headers.location).to.equal(expectedRedirectUrl)
  })

  lab.test('get flood-zone-results should error if a library error occurs', async () => {
    const options = { method: 'GET', url: fzrUrl }
    server.methods.getPsoContactsByPolygon = async () => ({ EmailAddress: 'psoContact@example.com', AreaName: 'Yorkshire', LocalAuthorities })
    riskService.getByPolygon = () => { throw new Error('Deliberate Testing Error ') }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(500)
  })

  lab.test('get flood-zone-results with a non england result should redirect to /england-only', async () => {
    const url = '/flood-zone-results?center=[341638,352001]&location=Caldecott%2520Green&polygon=[[479472,484194],[479467,484032],[479678,484015],[479691,484176],[479472,484194]]'
    const options = { method: 'GET', url }
    server.methods.getPsoContactsByPolygon = async () => optInPSOContactResponse
    riskService.getByPolygon = () => ({ in_england: false })
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    const { headers } = response
    const expectedRedirectUrl = '/england-only?center=%5B341638%2C352001%5D&location=Caldecott%2520Green&polygon=%5B%5B479472%2C484194%5D%2C%5B479467%2C484032%5D%2C%5B479678%2C484015%5D%2C%5B479691%2C484176%5D%2C%5B479472%2C484194%5D%5D'
    Code.expect(headers.location).to.equal(expectedRedirectUrl)
  })

  lab.test('a flood-zone-results without a polygon should redirect back to /confirm-location', async () => {
    const url = '/flood-zone-results?easting=479472&northing=484194&location=Pickering'
    const options = { method: 'GET', url }
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    const { headers } = response
    const expectedRedirectUrl = '/confirm-location?easting=479472&northing=484194&placeOrPostcode=Pickering&polygonMissing=true'
    Code.expect(headers.location).to.equal(expectedRedirectUrl)
  })

  const getByPolygonResponses = [
    [zone1GetByPolygonResponse, 1],
    [zone2GetByPolygonResponse, 2],
    [zone3GetByPolygonResponse, 3],
    [zone3WithDefenceGetByPolygonResponse, 3]
  ]

  getByPolygonResponses.forEach(async ([getByPolygonResponse, expectedFloodZone]) => {
    const getDocument = async () => {
      const options = { method: 'GET', url: fzrUrl }
      riskService.getByPolygon = () => getByPolygonResponse
      server.methods.getPsoContactsByPolygon = async () => optInPSOContactResponse
      const response = await server.inject(options)
      const { payload } = response
      const { window: { document: doc } } = await new JSDOM(payload)
      return doc
    }
    lab.test(`flood-zone-results heading should state This location is in Flood Zone ${expectedFloodZone}`, async () => {
      const doc = await getDocument()
      const headingElement = doc.querySelectorAll('#main-content h1.govuk-heading-xl')
      Code.expect(headingElement.length).to.equal(1)
      Code.expect(headingElement[0].textContent).to.equal(`This location is in flood zone ${expectedFloodZone}`)
    })

    lab.test('flood-zone-results - Redraw the boundary url should contain the polygon', async () => {
      const doc = await getDocument()
      const redrawElement = doc.querySelectorAll('a[href*="confirm-location"]')
      Code.expect(redrawElement.length).to.equal(1)
      Code.expect(redrawElement[0].textContent).to.contain('Redraw the boundary of your site')
      Code.expect(redrawElement[0].href).to.equal(`confirm-location?easting=479472&northing=484194&placeOrPostcode=Pickering&polygon=${fzrUrlPolygon}`)
    })
  })
})
