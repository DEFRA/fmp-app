var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Code = require('code')

var jsonHelper = require('../../../server/views/helpers/json')

var testObject = {
  test: 'test1',
  tests: [{
    test: {
      foo: 'bar'
    },
    test1: {
      floo: 'blar'
    }
  }]
}

lab.experiment('json helper', function () {
  lab.test('gets capabilities', function (done) {
    var ret = jsonHelper(testObject)
    Code.expect(ret).to.be.a.string()
    done()
  })
})
