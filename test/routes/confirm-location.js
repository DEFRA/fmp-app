var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Code = require('code')
var server = require('../../index.js')

// mock address service
var addressService = require('../../server/services/address')

addressService.findByPlace = function (place, callback) {
  callback(null, [{
    geometry_x: 300000,
    geometry_y: 400000
  }])
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
      server.stop(done)
    })
  })

  lab.test('confirm-location with invalid query expect redirect', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location'
    }

    server.inject(options, function (response) {
      Code.expect(response.headers.location).to.equal('/?err=place')
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
      Code.expect(response.statusCode).to.equal(400)
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
      Code.expect(response.headers.location).to.equal('/?err=place')
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
      Code.expect(response.headers.location).to.equal('/?err=place')
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
      Code.expect(response.headers.location).to.equal('/?err=place')
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
      server.stop(done)
    })
  })
})
