'use strict'
const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

lab.experiment('Ensure config is correct', () => {
  lab.test('test config', () => {
    Code.expect(() => {
      require('../config')
    }).not.to.throw()
  })
})
