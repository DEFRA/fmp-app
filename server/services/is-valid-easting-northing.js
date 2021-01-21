const isValidEastingService = require('../services/is-valid-easting')
const isValidNorthingService = require('../services/is-valid-northing')
module.exports = {
  get: async (easting, northing) => {
    var response = { isValid: false, easting: { eastingError: '', isValid: false }, northing: { northingError: '', isValid: false } }
    var eastingResponse = await isValidEastingService.get(easting)
    var northingResponse = await isValidNorthingService.get(northing)
    if (eastingResponse.isValid && northingResponse.isValid) {
      response.isValid = true
    } else {
      response.isValid = false
      response.eastingError = eastingResponse.eastingError
      response.northingError = northingResponse.northingError
    }
    response.northing.isValid = northingResponse.isValid
    response.easting.isValid = eastingResponse.isValid
    return response
  }
}
