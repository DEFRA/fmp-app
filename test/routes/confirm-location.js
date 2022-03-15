const Lab = require('lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const headers = require('../models/page-headers')
const isEnglandService = require('../../server/services/is-england')
const createServer = require('../../server')

lab.experiment('confirm-location', () => {
  let server
  let restoreIsEnglandService

  lab.before(async () => {
    server = await createServer()
    await server.initialize()
    restoreIsEnglandService = isEnglandService.get
    isEnglandService.get = async (x, y) => {
      return { is_england: true }
    }
  })

  lab.after(async () => {
    await server.stop()
    isEnglandService.get = restoreIsEnglandService
  })

  lab.test('confirm-location with easting & northing', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?easting=360799&northing=388244'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers['confirm-location'].standard)
  })

  lab.test('confirm-location with easting only', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?easting=360799'
    }
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
  })

  lab.test('confirm-location with northing only', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?northing=388244'
    }
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
  })

  lab.test('confirm-location with invalid query expect redirect', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
  })

  lab.test('confirm-location with unknown parameter to return 400 page', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?thing=jksgfdjs'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
  })

  lab.test('confirm-location returns not in england redirection by E/N', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?easting=259309&northing=672290'
    }

    isEnglandService.get = async (x, y) => {
      return { is_england: false }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(response.headers.location).to.equal('/england-only?easting=259309&northing=672290')
  })

  lab.test('confirm-location returns not in england with place and postcode', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?placeOrPostcode=Newport&easting=333433&northing=186528'
    }

    isEnglandService.get = async (x, y) => {
      return { is_england: false }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(response.headers.location).to.equal('/england-only?placeOrPostcode=Newport&easting=333433&northing=186528')
  })

  lab.test('confirm-location returns not in england with NGR ST180772', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?nationalGridReference=ST180772&easting=31800&northing=177200'
    }

    isEnglandService.get = async (x, y) => {
      return { is_england: false }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(response.headers.location).to.equal('/england-only?nationalGridReference=ST180772&easting=31800&northing=177200')
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
  })

  lab.test('confirm-location with legacy place parameter redirects to homepage', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?place=co10+0nn'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(response.headers.location).to.equal('/?place=co10%200nn')
  })

  lab.test('confirm-location should throw an exception if isEnglandService returns false', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?easting=360799&northing=388244'
    }

    isEnglandService.get = async (x, y) => {
      return false
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(500)
  })

  lab.test('confirm-location view should contain location=placeOrPostcode if placeOrPostcode is set', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?placeOrPostcode=Newport&easting=333433&northing=186528'
    }

    isEnglandService.get = async (x, y) => {
      return { is_england: true }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)

    // Check that location=Newport is included in the flood-zone-results url
    const { result } = response
    const matchResults = result.match(/flood-zone-results\?easting=333433&amp;northing=186528&amp;location=Newport/g)
    Code.expect(matchResults.length).to.equal(1)
  })

  lab.test('confirm-location view should contain location=nationalGridReference if nationalGridReference is set', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?nationalGridReference=ST180772&easting=333433&northing=186528'
    }

    isEnglandService.get = async (x, y) => {
      return { is_england: true }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)

    // Check that location=ST180772 is included in the flood-zone-results url
    const { result } = response
    const matchResults = result.match(/flood-zone-results\?easting=333433&amp;northing=186528&amp;location=ST180772/g)
    Code.expect(matchResults.length).to.equal(1)
  })

  lab.test('confirm-location view should contain recipientemail if it is set', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?recipientemail=joe@example.com&easting=333433&northing=186528'
    }

    isEnglandService.get = async (x, y) => {
      return { is_england: true }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)

    // Check that recipientemail=joe@example.com is included in the flood-zone-results url
    const { result } = response
    const matchResults = result.match(/flood-zone-results\?easting=333433&amp;northing=186528&amp;.*recipientemail=joe%40example.com/g)
    Code.expect(matchResults.length).to.equal(1)
  })

  lab.test('confirm-location view should contain fullName if it is set', async () => {
    const options = {
      method: 'GET',
      url: '/confirm-location?fullName=joe%20bloggs&easting=333433&northing=186528'
    }

    isEnglandService.get = async (x, y) => {
      return { is_england: true }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)

    // Check that recipientemail=joe@example.com is included in the flood-zone-results url
    const { result } = response
    const matchResults = result.match(/flood-zone-results\?easting=333433&amp;northing=186528&amp;.*fullName=joe%20bloggs/g)
    Code.expect(matchResults.length).to.equal(1)
  })
})
