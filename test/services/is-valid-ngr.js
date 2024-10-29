require('dotenv').config({ path: 'config/.env-example' })
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const isValidNgrService = require('../../server/services/is-valid-ngr')

lab.experiment('is-valid-ngr', () => {
  lab.test('isValidNgrService.get should be valid if ngr of length 12 is valid', async () => {
    const response = await isValidNgrService.get('TQ2770808448')
    Code.expect(response).to.equal({ isValid: true })
  })

  lab.test('isValidNgrService.get should be valid if ngr of length 10 is valid', async () => {
    const response = await isValidNgrService.get('TQ27708084')
    Code.expect(response).to.equal({ isValid: true })
  })

  lab.test('isValidNgrService.get should be invalid if ngr is invalid', async () => {
    const response = await isValidNgrService.get('TQ27708084a')
    Code.expect(response).to.equal({ isValid: false })
  })

  lab.test('isValidNgrService.get should be invalid if ngr of length 10 is invalid', async () => {
    const response = await isValidNgrService.get('TQ2770808a')
    Code.expect(response).to.equal({ isValid: false })
  })

  lab.test('isValidNgrService.get should be invalid if ngr of length 12 is invalid', async () => {
    const response = await isValidNgrService.get('TQ277080812a')
    Code.expect(response).to.equal({ isValid: false })
  })
})
