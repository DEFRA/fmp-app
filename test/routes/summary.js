var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Code = require('code')
var server = require('../../index.js')
var dbObjects = require('../models/get-fmp-zones')
var headers = require('../models/page-headers')

var riskService = require('../../server/services/risk')

// Mock the risk service get
riskService.get = function (easting, northing, callback) {
  callback(null, dbObjects.zone1)
}

lab.experiment('Summary', function () {
  lab.test('Summary for zone 1', function (done) {
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
      Code.expect(response.payload).to.include(headers.summary.standard)
      Code.expect(response.payload).to.include(headers.summary.zone1)
      server.stop(done)
    })
  })

  lab.test('Summary for zone 2', function (done) {
    var options = {
      method: 'GET',
      url: '/summary/300000/400000'
    }

    // Mock the risk service get
    riskService.get = function (easting, northing, callback) {
      callback(null, dbObjects.zone2)
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.summary.standard)
      Code.expect(response.payload).to.include(headers.summary.zone2)
      server.stop(done)
    })
  })

  lab.test('Summary for zone 3', function (done) {
    var options = {
      method: 'GET',
      url: '/summary/300000/400000'
    }

    // Mock the risk service get
    riskService.get = function (easting, northing, callback) {
      callback(null, dbObjects.zone3)
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.summary.standard)
      Code.expect(response.payload).to.include(headers.summary.zone3)
      server.stop(done)
    })
  })

  lab.test('Summary for zone 3 area benefitting', function (done) {
    var options = {
      method: 'GET',
      url: '/summary/300000/400000'
    }

    // Mock the risk service get
    riskService.get = function (easting, northing, callback) {
      callback(null, dbObjects.areaBenefiting)
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.summary.standard)
      Code.expect(response.payload).to.include(headers.summary.zone3)
      Code.expect(response.payload).to.include(headers.summary.zoneAreaBen)
      server.stop(done)
    })
  })

  lab.test('Not in england hit to render not-england page', function (done) {
    var options = {
      method: 'GET',
      url: '/summary/300000/400000'
    }

    // Mock the risk service get
    riskService.get = function (easting, northing, callback) {
      callback(null, dbObjects.notInEngland)
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers['not-england'].standard)
      server.stop(done)
    })
  })

  lab.test('Risk service error handle', function (done) {
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
      Code.expect(response.payload).to.include(headers[500])
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
      Code.expect(response.payload).to.include(headers[400])
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
      Code.expect(response.payload).to.include(headers[400])
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
      Code.expect(response.payload).to.include(headers[400])
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
      Code.expect(response.payload).to.include(headers[400])
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
      Code.expect(response.payload).to.include(headers[404])
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
      Code.expect(response.payload).to.include(headers[400])
      server.stop(done)
    })
  })
})
