var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Code = require('code')
var server = require('../../index.js')
var headers = require('../models/page-headers')
var addressService = require('../../server/services/address')
var ngrToBngService = require('../../server/services/ngr-to-bng')

addressService.findByPlace = function (place, callback) {
  callback(null, [{
    geometry_x: 300000,
    geometry_y: 400000
  }])
}

lab.experiment('home', function () {
  lab.test('home page returns 200', function (done) {
    var options = {
      method: 'GET',
      url: '/'
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.home.standard)
      server.stop(done)
    })
  })

  lab.test('home page with invalidPlace error param', function (done) {
    var options = {
      method: 'GET',
      url: '/?err=invalidPlaceOrPostcode&placeOrPostcode=xxxx'
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.home.standard)
      Code.expect(response.payload).to.include(headers.home.invalidPlaceOrPostcode)
      server.stop(done)
    })
  })

  lab.test('home page without placeOrPostcode params', function (done) {
    var options = {
      method: 'GET',
      url: '/?err=invalidPlaceOrPostcode'
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(400)
      Code.expect(response.payload).to.include(headers[400])
      server.stop(done)
    })
  })

  lab.test('home page with invalid error param', function (done) {
    var options = {
      method: 'GET',
      url: '/?err=wefwef'
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(400)
      Code.expect(response.payload).to.include(headers[400])
      server.stop(done)
    })
  })

  lab.test('unknown url returns 404', function (done) {
    var options = {
      method: 'GET',
      url: '/jksfds'
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(404)
      Code.expect(response.payload).to.include(headers[404])
      server.stop(done)
    })
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
