require('dotenv').config({ path: 'config/.env-example' })
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const headers = require('../models/page-headers')
const createServer = require('../../server')
const { payloadMatchTest } = require('../utils')

lab.experiment('england-only', () => {
  let server

  lab.before(async () => {
    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    await server.stop()
  })

  lab.test('england-only with E/N', async () => {
    const options = {
      method: 'GET',
      url: '/england-only?easting=259309&&northing=672290'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers['england-only'].standard)
  })

  lab.test('england-only with E/N and place or postcode', async () => {
    const options = {
      method: 'GET',
      url: '/england-only?placeOrPostcode=Newport&easting=333433&northing=186528'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers['england-only'].standard)
  })

  lab.test('england-only with E/N and NGR', async () => {
    const options = {
      method: 'GET',
      url: '/england-only?nationalGridReference=ST180772&easting=31800&northing=177200'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers['england-only'].standard)
  })

  lab.test('england-only with E/N and centroid flag', async () => {
    const options = {
      method: 'GET',
      url: '/england-only?centroid=true&easting=31800&northing=177200'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers['england-only'].standard)
  })

  lab.test('england-only with northing only ', async () => {
    const options = {
      method: 'GET',
      url: '/england-only?northing=177200'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers['england-only'].standard)
  })

  lab.test('england-only with easting only', async () => {
    const options = {
      method: 'GET',
      url: '/england-only?easting=31800'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers['england-only'].standard)
  })

  lab.test('england-only without easting or northing', async () => {
    const options = {
      method: 'GET',
      url: '/england-only'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers['england-only'].standard)
  })

  lab.test('england-only with locationDetails in url should show the location details paragraph ', async () => {
    const options = {
      method: 'GET',
      url: '/england-only?easting=243218&northing=555241&placeOrPostcode=Wigtown&recipientemail=+&fullName=+&locationDetails=Wigtown%2C+Dumfries+and+Galloway%2C+Scotland'
    }
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers['england-only'].standard)
    const { payload } = response
    await payloadMatchTest(
      payload,
      /<p>Your search for 'Wigtown' has been placed in Dumfries and Galloway, Scotland<\/p>/g
    )
  })

  lab.test('england-only without locationDetails in url should not show the location details paragraph ', async () => {
    const options = {
      method: 'GET',
      url: '/england-only?easting=243218&northing=555241&placeOrPostcode=wigtown&recipientemail=+&fullName=+'
    }
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers['england-only'].standard)
    const { payload } = response
    await payloadMatchTest(payload, /<p>Your search for /g, 0)
  })
})
