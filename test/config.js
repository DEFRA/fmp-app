var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Code = require('code')

lab.experiment('Ensure config is correct', function () {
  lab.test('test config', function (done) {
    Code.expect(function () {
      require('../config')
    }).not.to.throw()
    done()
  })
})
