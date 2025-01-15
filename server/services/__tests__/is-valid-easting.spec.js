require('dotenv').config({ path: 'config/.env-example' })

const isValidEastingService = require('../../../server/services/is-valid-easting')

describe('is-valid-easting', () => {
  it('isValidEastingService.get should be valid if easting is between 1 and 700,000', async () => {
    const response = await isValidEastingService.get('10000')
    expect(response).toEqual({ isValid: true, eastingError: '' })
  })

  it('isValidEastingService.get should be invalid if easting is empty', async () => {
    const response = await isValidEastingService.get('')
    expect(response).toEqual({ isValid: false, eastingError: 'Enter an easting' })
  })

  it('isValidEastingService.get should be invalid if easting is NaN', async () => {
    const response = await isValidEastingService.get('bad')
    expect(response).toEqual({ isValid: false, eastingError: 'Enter an easting in the correct format' })
  })

  it('isValidEastingService.get should be invalid if easting is 0', async () => {
    const response = await isValidEastingService.get('0')
    expect(response).toEqual({ isValid: false, eastingError: 'Enter an easting in the correct format' })
  })

  it('isValidEastingService.get should be invalid if easting is > 700,000', async () => {
    const response = await isValidEastingService.get('700001')
    expect(response).toEqual({ isValid: false, eastingError: 'Enter an easting in the correct format' })
  })
})
