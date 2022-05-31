const Lab = require('@hapi/lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const createServer = require('../../server')
const psoContactDetails = require('../../server/services/pso-contact')
const riskService = require('../../server/services/risk')
const { payloadMatchTest } = require('../utils')

lab.experiment('flood-zone-results-explained', () => {
  let server
  let restoreGetPsoContacts
  let restoreGetByPolygon
  let restoreGetByPoint
  let restoreIgnoreUseAutomatedService

  const urlByPoint = '/flood-zone-results?easting=479472&northing=484194&location=Pickering&fullName=Joe%20Bloggs&recipientemail=joe@example.com'
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

    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    psoContactDetails.getPsoContacts = restoreGetPsoContacts
    riskService.getByPolygon = restoreGetByPolygon
    riskService.getByPoint = restoreGetByPoint
    psoContactDetails.ignoreUseAutomatedService = restoreIgnoreUseAutomatedService
    await server.stop()
  })

  const testIfP4DownloadButtonExists = async (payload, shouldExist = true) => {
    // Test that the Request flood risk assessment data heading is present
    await payloadMatchTest(payload, /<h2 class="govuk-heading-m">Request flood risk assessment data<\/h2>/g, shouldExist ? 0 : 1)
    await payloadMatchTest(payload, /<p class="govuk-heading-m">Request flood risk assessment data<\/p>/g, 0) // should never exist

    // Test that the 'Request your flood risk assessment data' button is present
    await payloadMatchTest(payload, /Request your flood risk assessment data/g, shouldExist ? 1 : 0)
  }

  lab.test('get flood-zone-results request data button should be hidden if useAutomated is false', async () => {
    const options = { method: 'GET', url: urlByPoint }
    psoContactDetails.getPsoContacts = () => ({
      EmailAddress: 'psoContact@example.com',
      AreaName: 'Yorkshire',
      useAutomatedService: false
    })
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    const { payload } = response
    testIfP4DownloadButtonExists(payload, false)
  })

  lab.test('get flood-zone-results request data button should be present if useAutomated is true', async () => {
    const options = { method: 'GET', url: urlByPoint }
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
    const options = { method: 'GET', url: urlByPoint }
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
})
