const Lab = require('@hapi/lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const createServer = require('../../server')
const psoContactDetails = require('../../server/services/pso-contact')
const riskService = require('../../server/services/risk')
const { payloadMatchTest } = require('../utils')
const isEnglandService = require('../../server/services/is-england')

lab.experiment('flood-zone-results-explained', () => {
  let server
  let restoreGetPsoContacts
  let restoreGetByPolygon
  let restoreGetByPoint
  let restoreIsEnglandService
  let restoreIgnoreUseAutomatedService
  // const urlByPoint = '/flood-zone-results?easting=479472&northing=484194&location=Pickering&fullName=Joe%20Bloggs&recipientemail=joe@example.com'
  const urlByPoint = '/flood-zone-results-explained?easting=358584&northing=172691&zone=FZ3&polygon=&center&location=358584%20172691&zoneNumber=3&fullName=%20&recipientemail='
  const urlByPolygon = '/flood-zone-results-explained?easting=476277&northing=182771&zone=FZ3&polygon=[[476236,182791],[476308,182809],[476318,182734],[476254,182739],[476236,182791]]&center[476277,182771]&location=thames&zoneNumber=3&fullName=%20&recipientemail=%20'

  lab.before(async () => {
    restoreGetPsoContacts = psoContactDetails.getPsoContacts
    restoreGetByPolygon = riskService.getByPolygon
    restoreGetByPoint = riskService.getByPoint
    restoreIgnoreUseAutomatedService = psoContactDetails.ignoreUseAutomatedService
    psoContactDetails.getPsoContacts = () => ({
      EmailAddress: 'psoContact@example.com',
      AreaName: 'Yorkshire',
      LocalAuthorities: 'South Oxfordshire',
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

  lab.test('get flood-zone-results-explained with valid easting & northing parameters should succeed', async () => {
    const options = {
      method: 'GET',
      url: urlByPoint
    }
    const response = await server.inject(options)
    const { payload } = response
    Code.expect(response.statusCode).to.equal(200)
    // await payloadMatchTest(payload, /<p class="govuk-body">Contact the Yorkshire at <a/g)
    // FCRM 3594
    await payloadMatchTest(payload, /<h1 class="govuk-heading-xl">Your results explained<\/h1>/g, 1)
    await payloadMatchTest(payload, /<h2 class="govuk-heading-s">More help and advice<\/h2>/g, 0)
  })

  const testIfP4DownloadButtonExists = async (payload, shouldExist = true) => {
    // Test that the Request flood risk assessment data heading is present
    await payloadMatchTest(payload, /<p class="govuk-body">Your email should say that you are requesting flood risk assessment data (also known as a Product 4) and include:\s<\/p>/g, shouldExist ? 0 : 1)
    await payloadMatchTest(payload, /<p class="govuk-heading-m">Getting a flood risk assessment<\/p>/g, 0) // should never exist

    // Test that the 'Request your flood risk assessment data' button is present
    await payloadMatchTest(payload, /Your email should say that you are requesting flood risk assessment data (also known as a Product 4) and include: /g, shouldExist ? 0 : 1)
  }

  lab.test('get flood-zone-results-explained request data button should be hidden if useAutomated is false and config.ignoreUseAutomatedService is false', async () => {
    const options = { method: 'GET', url: urlByPoint }
    psoContactDetails.getPsoContacts = () => ({
      EmailAddress: 'psoContact@example.com',
      AreaName: 'Yorkshire',
      LocalAuthorities: 'South Oxfordshire',
      useAutomatedService: false
    })
    psoContactDetails.ignoreUseAutomatedService = () => false
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(psoContactDetails.ignoreUseAutomatedService()).to.be.false()
    const { payload } = response
    await payloadMatchTest(payload, /<ul>the address<\/ul>/g, 0)
    await payloadMatchTest(payload, /<li>the address<\/li>/g, 1)
  })

  lab.test('return undefined when getPsoContacts is undefined ', async () => {
    const options = { method: 'GET', url: urlByPoint }
    psoContactDetails.getPsoContacts = () => undefined
    const { payload } = await server.inject(options)
    Code.expect(psoContactDetails.getPsoContacts()).to.be.equals(undefined)
    await payloadMatchTest(payload, /<span class="govuk-!-font-weight-bold"><\/span>/g, 2)
  })

  lab.test('get flood-zone-results-explained request data button should not shown be if useAutomated is undefined  and config.ignoreUseAutomatedService is false', async () => {
    const options = { method: 'GET', url: urlByPoint }
    psoContactDetails.getPsoContacts = () => ({
      EmailAddress: 'psoContact@example.com',
      AreaName: 'Yorkshire',
      LocalAuthorities: 'South Oxfordshire',
      useAutomatedService: undefined
    })
    psoContactDetails.ignoreUseAutomatedService = () => false
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(psoContactDetails.ignoreUseAutomatedService()).to.be.false()
    const { payload } = response
    await payloadMatchTest(payload, /<span class="govuk-!-font-weight-bold">South Oxfordshire<\/span>/g, 2)
    testIfP4DownloadButtonExists(payload, undefined)
  })

  const useAutomatedServiceValues = [true, false]
  const ignoreUseAutomatedServiceValues = [undefined, true]
  ignoreUseAutomatedServiceValues.forEach((ignoreUseAutomatedService) => {
    useAutomatedServiceValues.forEach((useAutomatedService) => {
      lab.test(`get flood-zone-results-explained request data button should be present if useAutomated is ${useAutomatedService}  and config.ignoreUseAutomatedService is ${ignoreUseAutomatedService}`, async () => {
        const options = { method: 'GET', url: urlByPoint }
        psoContactDetails.getPsoContacts = () => ({
          EmailAddress: 'psoContact@example.com',
          AreaName: 'Yorkshire',
          LocalAuthorities: 'South Oxfordshire',
          useAutomatedService
        })
        psoContactDetails.ignoreUseAutomatedService = () => ignoreUseAutomatedService
        const response = await server.inject(options)
        Code.expect(response.statusCode).to.equal(200)
        const { payload } = response
        testIfP4DownloadButtonExists(payload, true)
      })
    })
  })

  const localAuthorities = [undefined, 0]
  localAuthorities.forEach((localAuthority) => {
    lab.test('get flood-zone-results-explained request localAuthority should be empty when localAuthorithy is undefined ', async () => {
      const options = { method: 'GET', url: urlByPoint }
      psoContactDetails.getPsoContacts = () => ({
        EmailAddress: 'psoContact@example.com',
        AreaName: 'Yorkshire',
        LocalAuthorities: localAuthority,
        useAutomatedService: true
      })
      const response = await server.inject(options)
      Code.expect(response.statusCode).to.equal(200)
      const { payload } = response
      await payloadMatchTest(payload, /<span class="govuk-!-font-weight-bold"><\/span>/g, 2)
    })
  })

  lab.test('get flood-zone-results-explained should throw an error if a library error occurs', async () => {
    const options = { method: 'GET', url: urlByPoint }
    psoContactDetails.getPsoContacts = () => ({ EmailAddress: 'psoContact@example.com', AreaName: 'Yorkshire', LocalAuthorities: 'South Oxfordshire' })
    riskService.getByPoint = () => { throw new Error('Deliberate Testing Error ') }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('get flood-zone-results-explained page should be success when url by polygon is called', async () => {
    const options = { method: 'GET', url: urlByPolygon }
    psoContactDetails.getPsoContacts = () => ({ Location: 'thames' })
    riskService.getByPolygon = () => { throw new Error('Deliberate Testing Error ') }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('get flood-zone-results-explained should redirect to contact page', async () => {
    const url = '/flood-zone-results-explained?easting=476277&northing=182771&zone=FZ3&polygon=[[476236,182791],[476308,182809],[476318,182734],[476254,182739],[476236,182791]]&center[476277,182771]&location=thames&zoneNumber=3&fullName=%20&recipientemail=%20'

    const options = { method: 'POST', url: url }
    psoContactDetails.getPsoContacts = () => ({ EmailAddress: 'psoContact@example.com', AreaName: 'Yorkshire', Location: 'thames' })

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    const { headers } = response
    Code.expect(headers.location).to.equal('/contact')
  })
})
