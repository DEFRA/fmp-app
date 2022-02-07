const Lab = require('lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const headers = require('../models/page-headers')
const createServer = require('../../server')

lab.experiment('confirm-location', () => {
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
})
