var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Code = require('code')
var server = require('../../index.js')

lab.experiment('confirm-location', function () {
  lab.test('confirm-location with location', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location?place=wa41ht'
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

  lab.test('confirm-location with rubbish to redirect', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location?place=jksgfdjs'
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
