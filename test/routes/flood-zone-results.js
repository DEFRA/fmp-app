const Lab = require('lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const createServer = require('../../server')
const psoContactDetails = require('../../server/services/pso-contact')
const riskService = require('../../server/services/risk')
const { payloadMatchTest } = require('../utils')

lab.experiment('flood-zone-results', async () => {
  let server
  let restoreGetPsoContacts
  let restoreGetByPolygon
  let restoreGetByPoint

  const urlByPoint = '/flood-zone-results?easting=479472&northing=484194&location=Pickering&fullName=Joe%20Bloggs&recipientemail=joe@example.com'
  const urlByPolygon = '/flood-zone-results?location=Pickering&fullName=Joe%20Bloggs&recipientemail=joe@example.com&polygon=[[479472,484194],[479467,484032],[479678,484015],[479691,484176],[479472,484194]]&center=[479472,484194]'

  lab.before(async () => {
    restoreGetPsoContacts = psoContactDetails.getPsoContacts
    restoreGetByPolygon = riskService.getByPolygon
    restoreGetByPoint = riskService.getByPoint
    psoContactDetails.getPsoContacts = () => ({
      EmailAddress: 'psoContact@example.com',
      AreaName: 'Yorkshire'
    })

    riskService.getByPolygon = () => ({ in_england: true })
    riskService.getByPoint = () => ({ point_in_england: true })

    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    psoContactDetails.getPsoContacts = restoreGetPsoContacts
    riskService.getByPolygon = restoreGetByPolygon
    riskService.getByPoint = restoreGetByPoint
    await server.stop()
  })

  lab.test('get flood-zone-results with valid easting & northing parameters should succeed', async () => {
    const options = {
      method: 'GET',
      url: urlByPoint
    }

    const response = await server.inject(options)
    const { payload } = response
    Code.expect(response.statusCode).to.equal(200)
    await payloadMatchTest(payload, /<p class="govuk-body">Contact the Yorkshire at <a/g)
    // FCRM 3594
    await payloadMatchTest(payload, /<figcaption class="govuk-visually-hidden" aria-hidden="false">[\s\S]*[ ]{1}A map showing the flood risk for the location you have provided[\s\S]*<\/figcaption>/g, 1)
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

  const urls = [urlByPolygon, urlByPoint]
  urls.forEach((url) => {
    lab.test('get flood-zone-results with a non england result should redirect to /england-only', async () => {
      const options = { method: 'GET', url }
      psoContactDetails.getPsoContacts = () => ({ EmailAddress: 'psoContact@example.com', AreaName: 'Yorkshire' })
      riskService.getByPolygon = () => ({ in_england: false })
      riskService.getByPoint = () => ({ point_in_england: false })

      const response = await server.inject(options)
      Code.expect(response.statusCode).to.equal(302)
      const { headers } = response
      const expectedRedirectUrl = url === urlByPolygon
        ? '/england-only?centroid=true&easting=479472&northing=484194'
        : '/england-only?easting=479472&northing=484194'
      Code.expect(headers.location).to.equal(expectedRedirectUrl)
    })
  })

  lab.test('get flood-zone-results should error if a library error occurs', async () => {
    const options = { method: 'GET', url: urlByPolygon }
    psoContactDetails.getPsoContacts = () => ({ EmailAddress: 'psoContact@example.com', AreaName: 'Yorkshire' })
    riskService.getByPolygon = () => { throw new Error('Deliberate Testing Error ') }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(500)
  })
})
