const Lab = require('lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const proxyquire = require('proxyquire')

lab.experiment('ngr-to-bng', () => {
  let stubNgrToBng
  let ngrToBngService
  lab.before(async () => {
    stubNgrToBng = sinon.stub()
    // This proxyquire line requires the ngrToBngService but it will use stubNgrToBng rather than the externally imported module 'ngr-to-bng'
    ngrToBngService = proxyquire('../../server/services/ngr-to-bng', { 'ngr-to-bng': stubNgrToBng })
  })

  lab.after(async () => {
    sinon.restore()
  })

  lab.test('ngrToBngService should call ngrToBng', async () => {
    await ngrToBngService.convert('TQ2770808448')
    Code.expect(stubNgrToBng.calledOnce).to.be.true()
  })
})
