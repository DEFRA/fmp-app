'use strict'
const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

const jsonHelper = require('../../../server/views/helpers/json')

const testObject = {
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

lab.experiment('json helper', () => {
  lab.test('gets capabilities', () => {
    const ret = jsonHelper(testObject)
    Code.expect(ret).to.be.a.string()
  })
})
