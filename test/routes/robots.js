var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Code = require('code')
var server = require('../../index.js')

lab.experiment('robots.txt', function () {
  lab.test('robots.txt returns 200', function (done) {
    var options = {
      method: 'GET',
      url: '/robots.txt'
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include('User-agent: *\nDisallow: /\n')
      server.stop(done)
    })
  })
})
