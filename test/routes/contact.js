const Lab = require('@hapi/lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const createServer = require('../../server')
const { payloadMatchTest, titleTest } = require('../utils')

lab.experiment('contact', () => {
  let server

  lab.before(async () => {
    console.log('Creating server')
    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    console.log('Stopping server')
    await server.stop()
  })

  lab.test('contact', async () => {
    const options = {
      method: 'GET',
      url: '/contact'
    }

    const response = await server.inject(options)
    const { payload } = response
    Code.expect(response.headers).to.not.include('contact')
    Code.expect(response.statusCode).to.equal(200)
    await titleTest(payload, 'Request flood risk assessment data - Flood map for planning - GOV.UK')
  })

  const parametersToTest = [
    {
      zoneNumber: 10,
      polygon: [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]],
      cent: [1, 1],
      location: 'Pickering',
      areaName: 'Environment Agency team in East Anglia',
      psoEmailAddress: 'enquiries_eastanglia@environment-agency.gov.uk'
    },
    {
      zoneNumber: '',
      polygon: [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]],
      cent: [1, 1],
      location: 'Pickering',
      areaName: 'Environment Agency team in East Anglia',
      psoEmailAddress: 'enquiries_eastanglia@environment-agency.gov.uk'
    },
    {
      zoneNumber: '',
      polygon: '',
      cent: '',
      location: 'Pickering',
      areaName: 'Environment Agency team in East Anglia',
      psoEmailAddress: 'enquiries_eastanglia@environment-agency.gov.uk'
    },
    {
      zoneNumber: '',
      polygon: '',
      cent: '',
      location: '',
      areaName: '',
      psoEmailAddress: ''
    }
  ]
  parametersToTest.forEach((parameterSet, parameterSetIndex) => {
    const { zoneNumber, polygon, cent, location } = parameterSet
    lab.test(`a contact POST should redirect to check-your-details - parameterSet: ${parameterSetIndex}`, async () => {
      const options = {
        method: 'POST',
        url: '/contact',
        payload: {
          recipientemail: 'joe@example.com',
          fullName: 'Joe Bloggs',
          easting: '360799',
          northing: '388244',
          zoneNumber,
          polygon,
          cent,
          location,
          areaName: '',
          psoEmailAddress: ''
        }
      }
      const expectedPolygon = polygon ? '1,1,1,2,2,2,2,1,1,1' : ''
      const expectedCenter = cent ? '1,1' : ''
      const expectedLocation = location || '360799,388244'

      const response = await server.inject(options)
      Code.expect(response.statusCode).to.equal(302)
      const expectedUrl = `/check-your-details?easting=360799&northing=388244&polygon=${expectedPolygon}&center=${expectedCenter}&location=${expectedLocation}&zoneNumber=${zoneNumber}&fullName=Joe Bloggs&recipientemail=joe@example.com&psoEmailAddress=null&areaName=null`
      Code.expect(response.headers.location).to.equal(expectedUrl)
    })
  })

  const fullNames = ['', ' ', '123']
  fullNames.forEach((fullName) => {
    lab.test('a contact POST with an invalid fullName should load contact view with errors', async () => {
      const options = {
        method: 'POST',
        url: '/contact',
        payload: {
          recipientemail: 'joe@example.com',
          fullName,
          easting: '360799',
          northing: '388244',
          zoneNumber: 10,
          polygon: [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]],
          cent: [1, 1],
          location: 'Pickering'
        }
      }

      const response = await server.inject(options)
      Code.expect(response.statusCode).to.equal(200)
      const { request, payload } = response
      const { path } = request
      Code.expect(path).to.equal('/contact')
      await payloadMatchTest(payload, /<span class="govuk-visually-hidden">Error:<\/span> Enter your full name/g)
      await payloadMatchTest(payload, /<a href="#fullName">Enter your full name<\/a>/g)
    })
  })

  const recipientEmails = ['', ' ', '123']
  recipientEmails.forEach((recipientemail) => {
    lab.test('a contact POST with an invalid recipientemail should load contact view with errors', async () => {
      const options = {
        method: 'POST',
        url: '/contact',
        payload: {
          recipientemail,
          fullName: 'Joe Bloggs',
          easting: '360799',
          northing: '388244',
          zoneNumber: 10,
          polygon: [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]],
          cent: [1, 1],
          location: 'Pickering'
        }
      }

      const response = await server.inject(options)
      Code.expect(response.statusCode).to.equal(200)
      const { request, payload } = response
      const { path } = request
      Code.expect(path).to.equal('/contact')
      await payloadMatchTest(payload, /<span class="govuk-visually-hidden">Error:<\/span> Enter an email address in the correct format, like name@example.com/g)
      await payloadMatchTest(payload, /<a href="#recipientemail">Enter an email address in the correct format, like name@example.com<\/a>/g)
      await titleTest(payload, 'Error: Request flood risk assessment data - Flood map for planning - GOV.UK')
    })
  })

  fullNames.forEach((fullName) => {
    lab.test('a contact POST with an invalid recipientemail and fullname should load contact view with errors', async () => {
      const options = {
        method: 'POST',
        url: '/contact',
        payload: {
          recipientemail: '',
          fullName,
          easting: '360799',
          northing: '388244',
          zoneNumber: 10,
          polygon: [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]],
          cent: [1, 1],
          location: 'Pickering'
        }
      }

      const response = await server.inject(options)
      Code.expect(response.statusCode).to.equal(200)
      const { request, payload } = response
      const { path } = request
      Code.expect(path).to.equal('/contact')
      await payloadMatchTest(payload, /<span class="govuk-visually-hidden">Error:<\/span> Enter an email address in the correct format, like name@example.com/g)
      await payloadMatchTest(payload, /<a href="#recipientemail">Enter an email address in the correct format, like name@example.com<\/a>/g)
      await payloadMatchTest(payload, /<span class="govuk-visually-hidden">Error:<\/span> Enter your full name/g)
      await payloadMatchTest(payload, /<a href="#fullName">Enter your full name<\/a>/g)
    })
  })

  const eastingNorthingValues = [{ easting: '360799' }, { northing: '388244' }]
  eastingNorthingValues.forEach((eastingNorthingValues) => {
    lab.test('a contact POST with a missing easting or northing should throw an error', async () => {
      const options = {
        method: 'POST',
        url: '/contact',
        payload: {
          recipientemail: 'joe@example.com',
          fullName: 'Joe Bloggs',
          easting: eastingNorthingValues.easting,
          northing: eastingNorthingValues.northing,
          zoneNumber: 10,
          polygon: [[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]],
          cent: [1, 1],
          location: 'Pickering'
        }
      }

      const response = await server.inject(options)
      Code.expect(response.statusCode).to.equal(500)
    })
  })
})
