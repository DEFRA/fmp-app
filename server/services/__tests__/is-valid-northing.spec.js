require('dotenv').config({ path: 'config/.env-example' })

const isValidNorthingService = require('../../../server/services/is-valid-northing')

describe('is-valid-northing', () => {
  it('isValidNorthingService.get should be valid if northing is between 1 and 1,300,000', async () => {
    const response = await isValidNorthingService.get('10000')
    expect(response).toEqual({ isValid: true, northingError: '' })
  })

  it('isValidNorthingService.get should be invalid if northing is empty', async () => {
    const response = await isValidNorthingService.get('')
    expect(response).toEqual({ isValid: false, northingError: 'Enter a northing' })
  })

  it('isValidNorthingService.get should be invalid if northing is NaN', async () => {
    const response = await isValidNorthingService.get('bad')
    expect(response).toEqual({ isValid: false, northingError: 'Enter a northing in the correct format' })
  })

  it('isValidNorthingService.get should be invalid if northing is 0', async () => {
    const response = await isValidNorthingService.get('0')
    expect(response).toEqual({ isValid: false, northingError: 'Enter a northing in the correct format' })
  })

  it('isValidNorthingService.get should be invalid if northing is > 1,300,000', async () => {
    const response = await isValidNorthingService.get('1300001')
    expect(response).toEqual({ isValid: false, northingError: 'Enter a northing in the correct format' })
  })
})
