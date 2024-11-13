const Lab = require('@hapi/lab')
const lab = (exports.lab = Lab.script())
const Code = require('@hapi/code')
const { validateSchema } = require('../config/schema')

lab.experiment('validateSchema', () => {
  // Note the rest of schema is covered by the tests in config.js
  lab.test('validate schema should throw an error when an invalid schema is passed', async () => {
    Code.expect(() => {
      validateSchema({})
    }).to.throw()
  })
})
