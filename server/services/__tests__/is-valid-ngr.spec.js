require('dotenv').config({ path: 'config/.env-example' })

const isValidNgrService = require('../../../server/services/is-valid-ngr')

describe('is-valid-ngr', () => {
  it('isValidNgrService.get should be valid if ngr of length 12 is valid', async () => {
    const response = await isValidNgrService.get('TQ2770808448')
    expect(response).toEqual({ isValid: true })
  })

  it('isValidNgrService.get should be valid if ngr of length 10 is valid', async () => {
    const response = await isValidNgrService.get('TQ27708084')
    expect(response).toEqual({ isValid: true })
  })

  it('isValidNgrService.get should be invalid if ngr is invalid', async () => {
    const response = await isValidNgrService.get('TQ27708084a')
    expect(response).toEqual({ isValid: false })
  })

  it('isValidNgrService.get should be invalid if ngr of length 10 is invalid', async () => {
    const response = await isValidNgrService.get('TQ2770808a')
    expect(response).toEqual({ isValid: false })
  })

  it('isValidNgrService.get should be invalid if ngr of length 12 is invalid', async () => {
    const response = await isValidNgrService.get('TQ277080812a')
    expect(response).toEqual({ isValid: false })
  })
})
