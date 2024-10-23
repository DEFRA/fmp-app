const Lab = require('@hapi/lab')
const lab = (exports.lab = Lab.script())
const Code = require('@hapi/code')
require('dotenv').config()

lab.experiment('Ensure config is correct', () => {
  lab.test('test config', () => {
    Code.expect(() => {
      require('../config')
    }).not.to.throw()
  })
})
