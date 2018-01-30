const Lab = require('lab')
const Code = require('code')
const glupe = require('glupe')
const lab = exports.lab = Lab.script()
const headers = require('../models/page-headers')
const isEnglandService = require('../../server/services/is-england')
const { manifest, options } = require('../../server')

lab.experiment('confirm-location', () => {
  let server

  lab.before(async () => {
    server = await glupe.compose(manifest, options)

    isEnglandService.get = async (x, y) => {
      return { is_england: true }
    }
  })

  lab.test('confirm-location with easting & northing', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?easting=360799&northing=388244'
    }

    const response = await server.inject(options)
    Code.expect(response.headers).to.not.include('location')
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers['confirm-location'].standard)
  })

  lab.test('confirm-location with easting only', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?easting=360799'
    }
    const response = await server.inject(options)
    Code.expect(response.headers).to.not.include('location')
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.payload).to.include(headers['400'])
  })

  lab.test('confirm-location with northing only', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?northing=388244'
    }
    const response = await server.inject(options)
    Code.expect(response.headers).to.not.include('location')
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.payload).to.include(headers['400'])
  })

  lab.test('confirm-location with invalid query expect redirect', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location'
    }

    const response = await server.inject(options)
    Code.expect(response.headers).to.not.include('location')
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.payload).to.include(headers['400'])
  })

  lab.test('confirm-location with unknown parameter to return 400 page', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?thing=jksgfdjs'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.payload).to.contain(headers[400])
  })

  lab.test('confirm-location returns not in england redirection', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?easting=259309&northing=672290'
    }

    isEnglandService.get = async (x, y) => {
      return { is_england: false }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.contain(headers['not-england'].standard)
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
    Code.expect(response.payload).to.contain(headers[500])
  })
})
