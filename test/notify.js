const Lab = require('lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const Email = require('../server/email/notify')
lab.experiment('Notify Email test', () => {
  lab.test('Notify Email Test function ', () => {
    Code.expect(Email).to.be.a.function()
  })
})
