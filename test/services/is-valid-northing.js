
const Lab = require('lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const isValidNorthingService = require('../../server/services/is-valid-northing')

lab.experiment('is-valid-northing', () => {
  lab.test('isValidNorthingService.get should be valid if northing is between 1 and 1,300,000', async () => {
    const response = await isValidNorthingService.get('10000')
    Code.expect(response).to.equal({ isValid: true, northingError: '' })
  })

  lab.test('isValidNorthingService.get should be invalid if northing is empty', async () => {
    const response = await isValidNorthingService.get('')
    Code.expect(response).to.equal({ isValid: false, northingError: 'Enter a northing' })
  })

  lab.test('isValidNorthingService.get should be invalid if northing is NaN', async () => {
    const response = await isValidNorthingService.get('bad')
    Code.expect(response).to.equal({ isValid: false, northingError: 'Enter a northing in the correct format' })
  })

  lab.test('isValidNorthingService.get should be invalid if northing is 0', async () => {
    const response = await isValidNorthingService.get('0')
    Code.expect(response).to.equal({ isValid: false, northingError: 'Enter a northing in the correct format' })
  })

  lab.test('isValidNorthingService.get should be invalid if northing is > 1,300,000', async () => {
    const response = await isValidNorthingService.get('1300001')
    Code.expect(response).to.equal({ isValid: false, northingError: 'Enter a northing in the correct format' })
  })
})
