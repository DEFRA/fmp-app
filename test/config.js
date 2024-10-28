const Lab = require('@hapi/lab')
const lab = (exports.lab = Lab.script())
const Code = require('@hapi/code')
const { toBool } = require('../config/toBool')
require('dotenv').config()

lab.experiment('Ensure config is correct', () => {
  lab.test('test config', () => {
    Code.expect(() => {
      require('../config')
    }).not.to.throw()
  })
})

lab.experiment('toBool function', () => {
  lab.test('toBool true should be true', () => Code.expect(toBool(true)).to.equal(true))
  lab.test('toBool "true" should be true', () => Code.expect(toBool('true')).to.equal(true))
  lab.test('toBool false should be false', () => Code.expect(toBool(false)).to.equal(false))
  lab.test('toBool "false" should be false', () => Code.expect(toBool('false')).to.equal(false))
})
