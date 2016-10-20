var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Code = require('code')
var server = require('../../index.js')
var headers = require('../models/page-headers')

// mock address service
var addressService = require('../../server/services/address')
var isEnglandService = require('../../server/services/is-england')
var ngrToBngService = require('../../server/services/ngr-to-bng')
addressService.findByPlace = function (place, callback) {
  callback(null, [{
    geometry_x: 300000,
    geometry_y: 400000
  }])
}

isEnglandService.get = function (x, y, callback) {
  callback(null, { is_england: true })
}

lab.experiment('confirm-location', function () {
  lab.test('confirm-location with location', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location?place=wa41ht'
    }

    addressService.findByPlace = function (place, callback) {
      callback(null, [{
        geometry_x: 300000,
        geometry_y: 400000
      }])
    }

    server.inject(options, function (response) {
      Code.expect(response.headers).to.not.include('location')
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers['confirm-location'].standard)
      server.stop(done)
    })
  })

  lab.test('confirm-location with ngr', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location?place=TQ2770808448'
    }

    server.inject(options, function (response) {
      Code.expect(response.headers).to.not.include('location')
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers['confirm-location'].standard)
      server.stop(done)
    })
  })

  lab.test('confirm-location with invalid query expect redirect', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location'
    }

    server.inject(options, function (response) {
      Code.expect(response.headers.location).to.equal('/?err=noPlace')
      Code.expect(response.statusCode).to.equal(302)
      server.stop(done)
    })
  })

  lab.test('confirm-location with location search error', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location?place=jksgfdjs'
    }

    addressService.findByPlace = function (place, callback) {
      callback(new Error('location error'))
    }

    server.inject(options, function (response) {
      Code.expect(response.headers.location).to.equal('/?err=invalidPlace')
      Code.expect(response.statusCode).to.equal(302)
      server.stop(done)
    })
  })

  lab.test('confirm-location with rubbish to redirect', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location?place=jksgfdjs'
    }

    addressService.findByPlace = function (place, callback) {
      callback(null, [])
    }

    server.inject(options, function (response) {
      Code.expect(response.headers.location).to.equal('/?err=invalidPlace')
      Code.expect(response.statusCode).to.equal(302)
      server.stop(done)
    })
  })

  lab.test('confirm-location with bad easting from location', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location?place=wa41ht'
    }

    addressService.findByPlace = function (place, callback) {
      callback(null, [{
        geometry_x: 300000
      }])
    }

    server.inject(options, function (response) {
      Code.expect(response.headers.location).to.equal('/?err=invalidPlace')
      Code.expect(response.statusCode).to.equal(302)
      server.stop(done)
    })
  })

  lab.test('confirm-location with bad northing from location', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location?place=jksgfdjs'
    }

    addressService.findByPlace = function (place, callback) {
      callback(null, [{
        geometry_y: 300000
      }])
    }

    server.inject(options, function (response) {
      Code.expect(response.headers.location).to.equal('/?err=invalidPlace')
      Code.expect(response.statusCode).to.equal(302)
      server.stop(done)
    })
  })

  lab.test('confirm-location with unknown parameter to return 400 page', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location?thing=jksgfdjs'
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(400)
      Code.expect(response.payload).to.contain(headers[400])
      server.stop(done)
    })
  })

  lab.test('confirm-location returns not in england redirection', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location?place=glasgow'
    }

    addressService.findByPlace = function (place, callback) {
      callback(null, [{
        geometry_x: 300000,
        geometry_y: 400000
      }])
    }

    isEnglandService.get = function (x, y, callback) {
      callback(null, { is_england: false })
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.contain(headers['not-england'].standard)
      server.stop(done)
    })
  })

  lab.test('NGR fails to return easting but ok address', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location?place=NN729575'
    }
    ngrToBngService.convert = function (term) {
      return {
        easting: null,
        northing: 100000
      }
    }

    addressService.findByPlace = function (place, callback) {
      callback(null, [{
        geometry_x: 300000,
        geometry_y: 400000
      }])
    }

    isEnglandService.get = function (x, y, callback) {
      callback(null, { is_england: true })
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers['confirm-location'].standard)
      server.stop(done)
    })
  })

  lab.test('NGR fails to return northing but ok address', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location?place=NN729575'
    }
    ngrToBngService.convert = function (term) {
      return {
        easting: 100000,
        northing: null
      }
    }
    addressService.findByPlace = function (place, callback) {
      callback(null, [{
        geometry_x: 300000,
        geometry_y: 400000
      }])
    }
    isEnglandService.get = function (x, y, callback) {
      callback(null, { is_england: true })
    }
    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers['confirm-location'].standard)
      server.stop(done)
    })
  })

  lab.test('NGR fails', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location?place=NN729575'
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

  lab.test('isEngland Errors', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location?place=london'
    }

    isEnglandService.get = function (x, y, callback) {
      callback(new Error('is england error'))
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(500)
      Code.expect(response.payload).to.contain(headers[500])
      server.stop(done)
    })
  })
})
