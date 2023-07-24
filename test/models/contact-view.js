
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const contactviewmodel = require('./../../server/models/contact-view')
lab.experiment('contact view model test', () => {
  lab.test('contact view model function ', () => {
    Code.expect(contactviewmodel).to.be.a.function()
  })
})
