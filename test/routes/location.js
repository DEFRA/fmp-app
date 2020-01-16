const Lab = require('lab')
const Code = require('code')
const glupe = require('glupe')
const lab = exports.lab = Lab.script()
const QueryString = require('querystring')
const URL = require('url')
const headers = require('../models/page-headers')
const addressService = require('../../server/services/address')
const ngrToBngService = require('../../server/services/ngr-to-bng')
const { manifest, options } = require('../../server')

lab.experiment('home', async () => {
  let server

  lab.before(async () => {
    server = await glupe.compose(manifest, options)

    addressService.findByPlace = async (place) => {
      return [{
        geometry_x: 300000,
        geometry_y: 400000
      }]
    }
  })

  lab.test('location page returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/'
    }

    const response = await await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('unknown url returns 404', async () => {
    const options = {
      method: 'GET',
      url: '/jksfds'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(404)
    Code.expect(response.payload).to.include(headers[404])
  })

  lab.test('location page with ngr', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'nationalGridReference',
        nationalGridReference: 'TQ2770808448'
      }
    }

    const response = await server.inject(options)
    const responseURL = URL.parse(response.headers.location)
    const responseQueryParams = QueryString.parse(responseURL.query)
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(responseURL.pathname).to.equal('/confirm-location')
    Code.expect(responseQueryParams.easting).to.equal('527708')
    Code.expect(responseQueryParams.northing).to.equal('108448')
    Code.expect(responseQueryParams.nationalGridReference).to.equal('TQ2770808448')
  })

  lab.test('location page with placeOrPostcode', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: 'Warrington'
      }
    }

    addressService.findByPlace = async (place) => {
      return [{
        geometry_x: 360799,
        geometry_y: 388244
      }]
    }

    const response = await server.inject(options)
    const responseURL = URL.parse(response.headers.location)
    const responseQueryParams = QueryString.parse(responseURL.query)
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(responseURL.pathname).to.equal('/confirm-location')
    Code.expect(responseQueryParams.easting).to.equal('360799')
    Code.expect(responseQueryParams.northing).to.equal('388244')
    Code.expect(responseQueryParams.placeOrPostcode).to.equal('Warrington')
  })

  lab.test.skip('location page with location search error', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: 'Warrington'
      }
    }

    addressService.findByPlace = function (place, callback) {
      callback(new Error('location error'))
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.location.standard)
    Code.expect(response.payload).to.include(headers.location.invalidPlaceOrPostcode)
  })

  lab.test.skip('location page with rubbish to redirect', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: 'Warrington'
      }
    }

    addressService.findByPlace = function (place, callback) {
      callback(null, [])
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.location.standard)
    Code.expect(response.payload).to.include(headers.location.invalidPlaceOrPostcode)
  })

  lab.test('location page without placeOrPostcode', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: ''
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.location.standard)
    Code.expect(response.payload).to.include(headers.location.invalidPlaceOrPostcode)
  })

  lab.test('location page without placeOrPostcode', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'placeOrPostcode'
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.location.standard)
    Code.expect(response.payload).to.include(headers.location.invalidPlaceOrPostcode)
  })

  lab.test('location page without nationalGridReference', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'nationalGridReference',
        nationalGridReference: ''
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.location.standard)
    Code.expect(response.payload).to.include(headers.location.invalidNationalGridReference)
  })

  lab.test('location page without nationalGridReference', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'nationalGridReference'
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.location.standard)
    Code.expect(response.payload).to.include(headers.location.invalidNationalGridReference)
  })

  lab.test('location page with bad national grid reference', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'nationalGridReference',
        nationalGridReference: 'NY395557a'
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.location.standard)
    Code.expect(response.payload).to.include(headers.location.invalidNationalGridReference)
  })

  lab.test('location page without an easting', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'eastingNorthing',
        northing: 123456
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.location.standard)
    Code.expect(response.payload).to.include(headers.location.invalidEasting)
  })

  lab.test('location page without an easting', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'eastingNorthing',
        easting: NaN,
        northing: 123456
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.location.standard)
    Code.expect(response.payload).to.include(headers.location.invalidEasting)
  })

  lab.test('location page without a northing', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'eastingNorthing',
        easting: 123456
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.location.standard)
    Code.expect(response.payload).to.include(headers.location.invalidNorthing)
  })

  lab.test('location page without a northing', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'eastingNorthing',
        easting: 123456,
        northing: NaN
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.location.standard)
    Code.expect(response.payload).to.include(headers.location.invalidNorthing)
  })

  lab.test('location page without an easting or northing', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'eastingNorthing'
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.location.standard)
    Code.expect(response.payload).to.include(headers.location.invalidEastingAndNorthing)
  })

  lab.test('location page without an easting or northing', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'eastingNorthing',
        easting: NaN,
        northing: NaN
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.location.standard)
    Code.expect(response.payload).to.include(headers.location.invalidEastingAndNorthing)
  })

  lab.test('location page with bad easting from location', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: 'wa41ht'
      }
    }

    addressService.findByPlace = async (place) => {
      return [{ geometry_x: 300000 }]
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.location.standard)
    Code.expect(response.payload).to.include(headers.location.invalidPlaceOrPostcode)
  })

  lab.test('location page with bad northing from location', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: 'wa41ht'
      }
    }

    addressService.findByPlace = async (place) => {
      return [{ geometry_y: 300000 }]
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.location.standard)
    Code.expect(response.payload).to.include(headers.location.invalidPlaceOrPostcode)
  })

  lab.test('location page NGR fails to return easting but ok address', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'nationalGridReference',
        nationalGridReference: 'NN729575'
      }
    }

    ngrToBngService.convert = (term) => {
      return {
        easting: null,
        northing: 100000
      }
    }

    const response = await server.inject(options)
    const responseURL = URL.parse(response.headers.location)
    const responseQueryParams = QueryString.parse(responseURL.query)
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(responseURL.pathname).to.equal('/confirm-location')
    Code.expect(responseQueryParams.easting).to.equal('')
    Code.expect(responseQueryParams.northing).to.equal('100000')
    Code.expect(responseQueryParams.nationalGridReference).to.equal('NN729575')
  })

  lab.test('location page NGR fails to return northing but ok address', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'nationalGridReference',
        nationalGridReference: 'NN729575'
      }
    }

    ngrToBngService.convert = (term) => {
      return {
        easting: 100000,
        northing: null
      }
    }

    const response = await server.inject(options)
    const responseURL = URL.parse(response.headers.location)
    const responseQueryParams = QueryString.parse(responseURL.query)
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(responseURL.pathname).to.equal('/confirm-location')
    Code.expect(responseQueryParams.easting).to.equal('100000')
    Code.expect(responseQueryParams.northing).to.equal('')
    Code.expect(responseQueryParams.nationalGridReference).to.equal('NN729575')
  })

  lab.test('location page NGR fails', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'nationalGridReference',
        nationalGridReference: 'NN729575'
      }
    }

    ngrToBngService.convert = (term) => {
      return null
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(500)
    Code.expect(response.payload).to.contain(headers[500])
  })

  lab.test('location page with invalid easting or northing integer', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'eastingNorthing',
        easting: 1232545655,
        northing: 465465412
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.location.standard)
    Code.expect(response.payload).to.include(headers.location.invalidEastingAndNorthing)
  })

  lab.test('location page with negative easting or northing integer', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'eastingNorthing',
        easting: -12545,
        northing: -452165
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.location.standard)
    Code.expect(response.payload).to.include(headers.location.invalidEastingAndNorthing)
  })

  lab.test('location page with ngr', function (done) {
    var options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'nationalGridReference',
        nationalGridReference: 'TQ2770808448'
      }
    }

    server.inject(options, function (response) {
      Code.expect(response.headers).to.include('location')
      Code.expect(response.statusCode).to.equal(302)
      Code.expect(response.headers.location).to.equal('/confirm-location?easting=527708&northing=108448')
      server.stop(done)
    })
  })

  lab.test.skip('location page with location search error', function (done) {
    var options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: 'Warrington'
      }
    }

    addressService.findByPlace = function (place, callback) {
      callback(new Error('location error'))
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.location.standard)
      Code.expect(response.payload).to.include(headers.location.invalidPlaceOrPostcode)
      server.stop(done)
    })
  })

  lab.test.skip('location page with rubbish to redirect', function (done) {
    var options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: 'Warrington'
      }
    }

    addressService.findByPlace = function (place, callback) {
      callback(null, [])
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.location.standard)
      Code.expect(response.payload).to.include(headers.location.invalidPlaceOrPostcode)
      server.stop(done)
    })
  })

  lab.test('location page without placeOrPostcode', function (done) {
    var options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: ''
      }
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.location.standard)
      Code.expect(response.payload).to.include(headers.location.invalidPlaceOrPostcode)
      server.stop(done)
    })
  })

  lab.test('location page without placeOrPostcode', function (done) {
    var options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'placeOrPostcode'
      }
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.location.standard)
      Code.expect(response.payload).to.include(headers.location.invalidPlaceOrPostcode)
      server.stop(done)
    })
  })

  lab.test('location page without nationalGridReference', function (done) {
    var options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'nationalGridReference',
        nationalGridReference: ''
      }
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.location.standard)
      Code.expect(response.payload).to.include(headers.location.invalidNationalGridReference)
      server.stop(done)
    })
  })

  lab.test('location page without nationalGridReference', function (done) {
    var options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'nationalGridReference'
      }
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.location.standard)
      Code.expect(response.payload).to.include(headers.location.invalidNationalGridReference)
      server.stop(done)
    })
  })

  lab.test('location page without an easting', function (done) {
    var options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'eastingNorthing',
        northing: 123456
      }
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.location.standard)
      Code.expect(response.payload).to.include(headers.location.invalidEasting)
      server.stop(done)
    })
  })

  lab.test('location page without an easting', function (done) {
    var options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'eastingNorthing',
        easting: NaN,
        northing: 123456
      }
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.location.standard)
      Code.expect(response.payload).to.include(headers.location.invalidEasting)
      server.stop(done)
    })
  })

  lab.test('location page without a northing', function (done) {
    var options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'eastingNorthing',
        easting: 123456
      }
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.location.standard)
      Code.expect(response.payload).to.include(headers.location.invalidNorthing)
      server.stop(done)
    })
  })

  lab.test('location page without a northing', function (done) {
    var options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'eastingNorthing',
        easting: 123456,
        northing: NaN
      }
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.location.standard)
      Code.expect(response.payload).to.include(headers.location.invalidNorthing)
      server.stop(done)
    })
  })

  lab.test('location page without an easting or northing', function (done) {
    var options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'eastingNorthing'
      }
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.location.standard)
      Code.expect(response.payload).to.include(headers.location.invalidEastingAndNorthing)
      server.stop(done)
    })
  })

  lab.test('location page without an easting or northing', function (done) {
    var options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'eastingNorthing',
        easting: NaN,
        northing: NaN
      }
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.location.standard)
      Code.expect(response.payload).to.include(headers.location.invalidEastingAndNorthing)
      server.stop(done)
    })
  })

  lab.test('location page with bad easting from location', function (done) {
    var options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: 'wa41ht'
      }
    }

    addressService.findByPlace = function (place, callback) {
      callback(null, [{
        geometry_x: 300000
      }])
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.location.standard)
      Code.expect(response.payload).to.include(headers.location.invalidPlaceOrPostcode)
      server.stop(done)
    })
  })

  lab.test('location page with bad northing from location', function (done) {
    var options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: 'wa41ht'
      }
    }

    addressService.findByPlace = function (place, callback) {
      callback(null, [{
        geometry_y: 300000
      }])
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.location.standard)
      Code.expect(response.payload).to.include(headers.location.invalidPlaceOrPostcode)
      server.stop(done)
    })
  })

  lab.test('location page NGR fails to return easting but ok address', function (done) {
    var options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'nationalGridReference',
        nationalGridReference: 'NN729575'
      }
    }

    ngrToBngService.convert = function (term) {
      return {
        easting: null,
        northing: 100000
      }
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(302)
      Code.expect(response.headers.location).to.equal('/confirm-location?easting=null&northing=100000')
      server.stop(done)
    })
  })

  lab.test('location page NGR fails to return northing but ok address', function (done) {
    var options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'nationalGridReference',
        nationalGridReference: 'NN729575'
      }
    }

    ngrToBngService.convert = function (term) {
      return {
        easting: 100000,
        northing: null
      }
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(302)
      Code.expect(response.headers.location).to.equal('/confirm-location?easting=100000&northing=null')
      server.stop(done)
    })
  })

  lab.test('location page NGR fails', function (done) {
    var options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'nationalGridReference',
        nationalGridReference: 'NN729575'
      }
    }

    ngrToBngService.convert = function (term) {
      return null
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(500)
      Code.expect(response.payload).to.contain(headers[500])
      server.stop(done)
    })
  })

  lab.test('location page returns 200 when requested with legacy place param  - expect this to be via redirect from confirm-location', async () => {
    const options = {
      method: 'GET',
      url: '/location?place=co10 onn'
    }

    const response = await await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.location.standard)
  })
})
