const Lab = require('lab')
const Code = require('code')
const glupe = require('glupe')
const lab = exports.lab = Lab.script()
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

  lab.test('home page returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/'
    }

    const response = await await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.home.standard)
  })

  lab.test('home page with invalidPlace error param', async () => {
    const options = {
      method: 'GET',
      url: '/?err=invalidPlaceOrPostcode&placeOrPostcode=xxxx'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.home.standard)
    Code.expect(response.payload).to.include(headers.home.invalidPlaceOrPostcode)
  })

  lab.test('home page with invalidNationalGridReference error param', async () => {
    const options = {
      method: 'GET',
      url: '/?err=invalidNationalGridReference&nationalGridReference=xxxx'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.home.standard)
    Code.expect(response.payload).to.include(headers.home.invalidNationalGridReference)
  })

  lab.test('home page err invalidNationalGridReference without nationalGridReference param', async () => {
    const options = {
      method: 'GET',
      url: '/?err=invalidNationalGridReference'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.payload).to.include(headers[400])
  })

  lab.test('home page without placeOrPostcode params', async () => {
    const options = {
      method: 'GET',
      url: '/?err=invalidPlaceOrPostcode'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.payload).to.include(headers[400])
  })

  lab.test('home page with invalid error param', async () => {
    const options = {
      method: 'GET',
      url: '/?err=wefwef'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.payload).to.include(headers[400])
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

  lab.test('home page with ngr', async () => {
    const options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'nationalGridReference',
        nationalGridReference: 'TQ2770808448'
      }
    }

    const response = await server.inject(options)
    Code.expect(response.headers).to.include('location')
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(response.headers.location).to.equal('/confirm-location?easting=527708&northing=108448')
  })

  lab.test('home page with location search error', async () => {
    const options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: 'Warrington'
      }
    }

    addressService.findByPlace = function (place, callback) {
      callback(new Error('location error'))
    }

    const response = await server.inject(options)
    Code.expect(response.headers.location).to.equal('/?err=invalidPlaceOrPostcode&placeOrPostcode=Warrington')
    Code.expect(response.statusCode).to.equal(302)
  })

  lab.test('home page with rubbish to redirect', async () => {
    const options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: 'Warrington'
      }
    }

    addressService.findByPlace = function (place, callback) {
      callback(null, [])
    }

    const response = await server.inject(options)
    Code.expect(response.headers.location).to.equal('/?err=invalidPlaceOrPostcode&placeOrPostcode=Warrington')
    Code.expect(response.statusCode).to.equal(302)
  })

  lab.test('home page without placeOrPostcode', async () => {
    const options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: ''
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.home.standard)
    Code.expect(response.payload).to.include(headers.home.invalidPlaceOrPostcode)
  })

  lab.test('home page without placeOrPostcode', async () => {
    const options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'placeOrPostcode'
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.home.standard)
    Code.expect(response.payload).to.include(headers.home.invalidPlaceOrPostcode)
  })

  lab.test('home page without nationalGridReference', async () => {
    const options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'nationalGridReference',
        nationalGridReference: ''
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.home.standard)
    Code.expect(response.payload).to.include(headers.home.invalidNationalGridReference)
  })

  lab.test('home page without nationalGridReference', async () => {
    const options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'nationalGridReference'
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.home.standard)
    Code.expect(response.payload).to.include(headers.home.invalidNationalGridReference)
  })

  lab.test('home page with bad national grid reference', async () => {
    const options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'nationalGridReference',
        nationalGridReference: 'NY395557a'
      }
    }

    const response = await server.inject(options)
    Code.expect(response.headers.location).to.equal('/?err=invalidNationalGridReference&nationalGridReference=NY395557a')
    Code.expect(response.statusCode).to.equal(302)
  })

  lab.test('home page without an easting', async () => {
    const options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'eastingNorthing',
        northing: 123456
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.home.standard)
    Code.expect(response.payload).to.include(headers.home.invalidEasting)
  })

  lab.test('home page without an easting', async () => {
    const options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'eastingNorthing',
        easting: NaN,
        northing: 123456
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.home.standard)
    Code.expect(response.payload).to.include(headers.home.invalidEasting)
  })

  lab.test('home page without a northing', async () => {
    const options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'eastingNorthing',
        easting: 123456
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.home.standard)
    Code.expect(response.payload).to.include(headers.home.invalidNorthing)
  })

  lab.test('home page without a northing', async () => {
    const options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'eastingNorthing',
        easting: 123456,
        northing: NaN
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.home.standard)
    Code.expect(response.payload).to.include(headers.home.invalidNorthing)
  })

  lab.test('home page without an easting or northing', async () => {
    const options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'eastingNorthing'
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.home.standard)
    Code.expect(response.payload).to.include(headers.home.invalidEastingAndNorthing)
  })

  lab.test('home page without an easting or northing', async () => {
    const options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'eastingNorthing',
        easting: NaN,
        northing: NaN
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.home.standard)
    Code.expect(response.payload).to.include(headers.home.invalidEastingAndNorthing)
  })

  lab.test('home page with bad easting from location', async () => {
    const options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: 'wa41ht'
      }
    }

    addressService.findByPlace = async (place) => {
      return [{ geometry_x: 300000 }]
    }

    const response = await server.inject(options)
    Code.expect(response.headers.location).to.equal('/?err=invalidPlaceOrPostcode&placeOrPostcode=wa41ht')
    Code.expect(response.statusCode).to.equal(302)
  })

  lab.test('home page with bad northing from location', async () => {
    const options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: 'wa41ht'
      }
    }

    addressService.findByPlace = async (place) => {
      return [{ geometry_y: 300000 }]
    }

    const response = await server.inject(options)
    Code.expect(response.headers.location).to.equal('/?err=invalidPlaceOrPostcode&placeOrPostcode=wa41ht')
    Code.expect(response.statusCode).to.equal(302)
  })

  lab.test('home page NGR fails to return easting but ok address', async () => {
    const options = {
      method: 'POST',
      url: '/',
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
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(response.headers.location).to.equal('/confirm-location?easting=null&northing=100000')
  })

  lab.test('home page NGR fails to return northing but ok address', async () => {
    const options = {
      method: 'POST',
      url: '/',
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
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(response.headers.location).to.equal('/confirm-location?easting=100000&northing=null')
  })

  lab.test('home page NGR fails', async () => {
    const options = {
      method: 'POST',
      url: '/',
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

  lab.test('home page with invalid easting or northing integer', async () => {
    const options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'eastingNorthing',
        easting: 1232545655,
        northing: 465465412
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.home.standard)
    Code.expect(response.payload).to.include(headers.home.invalidEastingAndNorthing)
  })

  lab.test('home page with negative easting or northing integer', async () => {
    const options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'eastingNorthing',
        easting: -12545,
        northing: -452165
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.home.standard)
    Code.expect(response.payload).to.include(headers.home.invalidEastingAndNorthing)
  })

  lab.test('home page with ngr', function (done) {
    var options = {
      method: 'POST',
      url: '/',
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

  lab.test('home page with location search error', function (done) {
    var options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: 'Warrington'
      }
    }

    addressService.findByPlace = function (place, callback) {
      callback(new Error('location error'))
    }

    server.inject(options, function (response) {
      Code.expect(response.headers.location).to.equal('/?err=invalidPlaceOrPostcode&placeOrPostcode=Warrington')
      Code.expect(response.statusCode).to.equal(302)
      server.stop(done)
    })
  })

  lab.test('home page with rubbish to redirect', function (done) {
    var options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: 'Warrington'
      }
    }

    addressService.findByPlace = function (place, callback) {
      callback(null, [])
    }

    server.inject(options, function (response) {
      Code.expect(response.headers.location).to.equal('/?err=invalidPlaceOrPostcode&placeOrPostcode=Warrington')
      Code.expect(response.statusCode).to.equal(302)
      server.stop(done)
    })
  })

  lab.test('home page without placeOrPostcode', function (done) {
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
      Code.expect(response.payload).to.include(headers.home.standard)
      Code.expect(response.payload).to.include(headers.home.invalidPlaceOrPostcode)
      server.stop(done)
    })
  })

  lab.test('home page without placeOrPostcode', function (done) {
    var options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'placeOrPostcode'
      }
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.home.standard)
      Code.expect(response.payload).to.include(headers.home.invalidPlaceOrPostcode)
      server.stop(done)
    })
  })

  lab.test('home page without nationalGridReference', function (done) {
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
      Code.expect(response.payload).to.include(headers.home.standard)
      Code.expect(response.payload).to.include(headers.home.invalidNationalGridReference)
      server.stop(done)
    })
  })

  lab.test('home page without nationalGridReference', function (done) {
    var options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'nationalGridReference'
      }
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.home.standard)
      Code.expect(response.payload).to.include(headers.home.invalidNationalGridReference)
      server.stop(done)
    })
  })

  lab.test('home page without an easting', function (done) {
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
      Code.expect(response.payload).to.include(headers.home.standard)
      Code.expect(response.payload).to.include(headers.home.invalidEasting)
      server.stop(done)
    })
  })

  lab.test('home page without an easting', function (done) {
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
      Code.expect(response.payload).to.include(headers.home.standard)
      Code.expect(response.payload).to.include(headers.home.invalidEasting)
      server.stop(done)
    })
  })

  lab.test('home page without a northing', function (done) {
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
      Code.expect(response.payload).to.include(headers.home.standard)
      Code.expect(response.payload).to.include(headers.home.invalidNorthing)
      server.stop(done)
    })
  })

  lab.test('home page without a northing', function (done) {
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
      Code.expect(response.payload).to.include(headers.home.standard)
      Code.expect(response.payload).to.include(headers.home.invalidNorthing)
      server.stop(done)
    })
  })

  lab.test('home page without an easting or northing', function (done) {
    var options = {
      method: 'POST',
      url: '/',
      payload: {
        type: 'eastingNorthing'
      }
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.home.standard)
      Code.expect(response.payload).to.include(headers.home.invalidEastingAndNorthing)
      server.stop(done)
    })
  })

  lab.test('home page without an easting or northing', function (done) {
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
      Code.expect(response.payload).to.include(headers.home.standard)
      Code.expect(response.payload).to.include(headers.home.invalidEastingAndNorthing)
      server.stop(done)
    })
  })

  lab.test('home page with bad easting from location', function (done) {
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
      Code.expect(response.headers.location).to.equal('/?err=invalidPlaceOrPostcode&placeOrPostcode=wa41ht')
      Code.expect(response.statusCode).to.equal(302)
      server.stop(done)
    })
  })

  lab.test('home page with bad northing from location', function (done) {
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
      Code.expect(response.headers.location).to.equal('/?err=invalidPlaceOrPostcode&placeOrPostcode=wa41ht')
      Code.expect(response.statusCode).to.equal(302)
      server.stop(done)
    })
  })

  lab.test('home page NGR fails to return easting but ok address', function (done) {
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

  lab.test('home page NGR fails to return northing but ok address', function (done) {
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

  lab.test('home page NGR fails', function (done) {
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
})
