var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Code = require('code')
var server = require('../index.js')

lab.experiment('confirm-location', function () {
  lab.test('confirm-location with location', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location?place=wa41ht'
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      server.stop(done)
    })
  })

  lab.test('confirm-location with invalid query', function (done) {
    var options = {
      method: 'GET',
      url: '/confirm-location'
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(400)
      server.stop(done)
    })
  })
})
