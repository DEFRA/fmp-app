var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Code = require('code')
var server = require('../index.js')

lab.experiment('home', function () {
  lab.test('home page returns 200', function (done) {
    var options = {
      method: 'GET',
      url: '/'
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      server.stop(done)
    })
  })
})
