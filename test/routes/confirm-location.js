var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Code = require('code')
var server = require('../../index.js')
var headers = require('../models/page-headers')
var isEnglandService = require('../../server/services/is-england')

isEnglandService.get = function (x, y, callback) {
  callback(null, { is_england: true })
}

lab.experiment('confirm-location', function () {
  lab.test('confirm-location with easting & northing', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location?easting=360799&northing=388244'
    }

    server.inject(options, function (response) {
      Code.expect(response.headers).to.not.include('location')
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers['confirm-location'].standard)
      server.stop(done)
    })
  })

  lab.test('confirm-location with easting only', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location?easting=360799'
    }

    server.inject(options, function (response) {
      Code.expect(response.headers).to.not.include('location')
      Code.expect(response.statusCode).to.equal(400)
      Code.expect(response.payload).to.include(headers['400'])
      server.stop(done)
    })
  })

  lab.test('confirm-location with northing only', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location?northing=388244'
    }

    server.inject(options, function (response) {
      Code.expect(response.headers).to.not.include('location')
      Code.expect(response.statusCode).to.equal(400)
      Code.expect(response.payload).to.include(headers['400'])
      server.stop(done)
    })
  })

  lab.test('confirm-location with invalid query expect redirect', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location'
    }

    server.inject(options, function (response) {
      Code.expect(response.headers).to.not.include('location')
      Code.expect(response.statusCode).to.equal(400)
      Code.expect(response.payload).to.include(headers['400'])
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
      url: '/confirm-location?easting=259309&northing=672290'
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

  lab.test('isEngland Errors', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location?easting=360799&northing=388244'
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
