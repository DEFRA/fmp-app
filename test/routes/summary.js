var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Code = require('code')
var server = require('../../index.js')
var dbObjects = require('../models/get-fmp-zones')

var riskService = require('../../server/services/risk')

// Mock the risk service get
riskService.get = function (easting, northing, callback) {
  callback(null, dbObjects.zone1)
}

lab.experiment('Summary', function () {
  lab.test('normal hit', function (done) {
    var options = {
      method: 'GET',
      url: '/summary/300000/400000'
    }

    // Mock the risk service get
    riskService.get = function (easting, northing, callback) {
      callback(null, dbObjects.zone1)
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      server.stop(done)
    })
  })

  lab.test('normal hit', function (done) {
    var options = {
      method: 'GET',
      url: '/summary/300000/400000'
    }

    // Mock the risk service get
    riskService.get = function (easting, northing, callback) {
      callback(new Error('Service error'))
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(500)
      server.stop(done)
    })
  })

  lab.test('param validation easting 1', function (done) {
    var options = {
      method: 'GET',
      url: '/summary/800000/400000'
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(400)
      server.stop(done)
    })
  })

  lab.test('param validation easting 2', function (done) {
    var options = {
      method: 'GET',
      url: '/summary/asfsaf/400000'
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(400)
      server.stop(done)
    })
  })

  lab.test('param validation northing 1', function (done) {
    var options = {
      method: 'GET',
      url: '/summary/300000/-250000'
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(400)
      server.stop(done)
    })
  })

  lab.test('param validation northing 2', function (done) {
    var options = {
      method: 'GET',
      url: '/summary/800000/dsfs'
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(400)
      server.stop(done)
    })
  })

  lab.test('summary with no easting and northing returns 404 not found', function (done) {
    var options = {
      method: 'GET',
      url: '/summary'
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(404)
      server.stop(done)
    })
  })

  lab.test('summary with no easting and northing returns error page', function (done) {
    var options = {
      method: 'GET',
      url: '/summary/dsgfsd/test'
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(400)
      server.stop(done)
    })
  })
})
