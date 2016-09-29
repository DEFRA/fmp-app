var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Code = require('code')
var server = require('../../index.js')
var headers = require('../models/page-headers')

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
      url: '/?err=invalidPlace'
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.home.standard)
      Code.expect(response.payload).to.include(headers.home.invalidPlace)
      server.stop(done)
    })
  })

  lab.test('home page with noPlace error param', function (done) {
    var options = {
      method: 'GET',
      url: '/?err=noPlace'
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.home.standard)
      Code.expect(response.payload).to.include(headers.home.noPlace)
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
})
