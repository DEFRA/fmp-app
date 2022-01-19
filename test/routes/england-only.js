const Lab = require('lab')
const Code = require('code')
const glupe = require('glupe')
const lab = exports.lab = Lab.script()
const headers = require('../models/page-headers')
const { manifest, options } = require('../../server')

lab.experiment('confirm-location', () => {
  let server

  lab.before(async () => {
    server = await glupe.compose(manifest, options)
  })

  lab.test('not-england with E/N', async () => {
    const options = {
      method: 'GET',
      url: '/not-england?easting=259309&&northing=672290'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers['not-england'].standard)
  })

  lab.test('not-england with E/N and place or postcode', async () => {
    const options = {
      method: 'GET',
      url: '/not-england?placeOrPostcode=Newport&easting=333433&northing=186528'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers['not-england'].standard)
  })

  lab.test('not-england with E/N and NGR', async () => {
    const options = {
      method: 'GET',
      url: '/not-england?nationalGridReference=ST180772&easting=31800&northing=177200'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers['not-england'].standard)
  })

  lab.test('not-england with E/N and centroid flag', async () => {
    const options = {
      method: 'GET',
      url: '/not-england?centroid=true&easting=31800&northing=177200'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers['not-england'].standard)
  })

  lab.test('not-england with northing only ', async () => {
    const options = {
      method: 'GET',
      url: '/not-england?northing=177200'
    }

    const response = await server.inject(options)
    Code.expect(response.headers).to.not.include('not-england')
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.payload).to.include(headers['400'])
  })

  lab.test('not-england with easting only', async () => {
    const options = {
      method: 'GET',
      url: '/not-england?easting=31800'
    }

    const response = await server.inject(options)
    Code.expect(response.headers).to.not.include('not-england')
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.payload).to.include(headers['400'])
  })

  lab.test('not-england without easting or northing', async () => {
    const options = {
      method: 'GET',
      url: '/not-england'
    }

    const response = await server.inject(options)
    Code.expect(response.headers).to.not.include('not-england')
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.payload).to.include(headers['400'])
  })
})
