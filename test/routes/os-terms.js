var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Code = require('code')
var server = require('../../index.js')

lab.experiment('os-terms', function () {
  lab.test('os-terms page returns 200', function (done) {
    var options = {
      method: 'GET',
      url: '/os-terms'
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include('Ordnance Survey terms and conditions')
      server.stop(done)
    })
  })
})
