const Lab = require('@hapi/lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const { getApplicationReferenceNumber } = require('../../server/services/application-reference')
const Wreck = require('wreck')
const config = require('../../config')

lab.experiment('application-reference', () => {
  let restoreWreckGet

  lab.before(async () => {
    restoreWreckGet = Wreck.get
    Wreck.get = (url) => ({ payload: { toString: () => url } })
  })

  lab.after(async () => {
    Wreck.get = restoreWreckGet
  })

  lab.test('getApplicationReferenceNumber should call Wreck.get with the url config.functionAppUrl/reference-number', async () => {
    const applicationReferenceNumber = await getApplicationReferenceNumber()
    Code.expect(applicationReferenceNumber).to.equal(`${config.functionAppUrl}/reference-number`)
  })
})
