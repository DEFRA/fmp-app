var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Code = require('code')
var server = require('../../index.js')

lab.experiment('Summary', function () {
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
