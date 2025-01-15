require('dotenv').config({ path: 'config/.env-example' })

const isValidEastingService = require('../../../server/services/is-valid-easting')
const isValidNorthingService = require('../../../server/services/is-valid-northing')
const isValidEastingNorthingService = require('../../../server/services/is-valid-easting-northing')

describe('is-valid-easting-northing', () => {
  let restoreIsValidEastingService
  let restoreIsValidNorthingService

  beforeAll(async () => {
    restoreIsValidEastingService = isValidEastingService.get
    restoreIsValidNorthingService = isValidNorthingService.get
  })

  afterAll(async () => {
    isValidEastingService.get = restoreIsValidEastingService
    isValidNorthingService.get = restoreIsValidNorthingService
  })

  it('isValidEastingNorthingService.get should be valid if easting and northing services are valid', async () => {
    isValidEastingService.get = () => ({ isValid: true })
    isValidNorthingService.get = () => ({ isValid: true })

    const response = await isValidEastingNorthingService.get(10000, 20000)
    expect(response).toEqual({
      isValid: true,
      easting: { eastingError: '', isValid: true },
      northing: { northingError: '', isValid: true }
    })
  })

  it('isValidEastingNorthingService.get should not be valid if easting service is not valid', async () => {
    const eastingError = 'Enter an easting in the correct format'
    const northingError = ''
    isValidEastingService.get = () => ({ isValid: false, eastingError })
    isValidNorthingService.get = () => ({ isValid: true, northingError })

    const response = await isValidEastingNorthingService.get(10000, 20000)
    expect(response).toEqual({
      isValid: false,
      eastingError,
      northingError,
      easting: { eastingError: '', isValid: false }, // Question - is this correct?, It seems like eastingError ought to be populated here
      northing: { northingError: '', isValid: true }
    })
  })

  it('isValidEastingNorthingService.get should not be valid if northing service is not valid', async () => {
    const eastingError = ''
    const northingError = 'Enter a northing in the correct format'
    isValidEastingService.get = () => ({ isValid: true, eastingError })
    isValidNorthingService.get = () => ({ isValid: false, northingError })

    const response = await isValidEastingNorthingService.get(10000, 20000)
    expect(response).toEqual({
      isValid: false,
      eastingError,
      northingError,
      easting: { eastingError: '', isValid: true },
      northing: { northingError: '', isValid: false } // Question - is this correct?, It seems like northingError ought to be populated here
    })
  })
})
