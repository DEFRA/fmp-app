const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const isValidEastingService = require('../../server/services/is-valid-easting')

lab.experiment('is-valid-easting', () => {
  lab.test('isValidEastingService.get should be valid if easting is between 1 and 700,000', async () => {
    const response = await isValidEastingService.get('10000')
    Code.expect(response).to.equal({ isValid: true, eastingError: '' })
  })

  lab.test('isValidEastingService.get should be invalid if easting is empty', async () => {
    const response = await isValidEastingService.get('')
    Code.expect(response).to.equal({ isValid: false, eastingError: 'Enter an easting' })
  })

  lab.test('isValidEastingService.get should be invalid if easting is NaN', async () => {
    const response = await isValidEastingService.get('bad')
    Code.expect(response).to.equal({ isValid: false, eastingError: 'Enter an easting in the correct format' })
  })

  lab.test('isValidEastingService.get should be invalid if easting is 0', async () => {
    const response = await isValidEastingService.get('0')
    Code.expect(response).to.equal({ isValid: false, eastingError: 'Enter an easting in the correct format' })
  })

  lab.test('isValidEastingService.get should be invalid if easting is > 700,000', async () => {
    const response = await isValidEastingService.get('700001')
    Code.expect(response).to.equal({ isValid: false, eastingError: 'Enter an easting in the correct format' })
  })
})
