module.exports = {
  get: (easting) => {
    var formattedEasting = easting.trim()
    var response = { eastingError: '', isValid: false }
    if (formattedEasting) {
      if (!isNaN(formattedEasting)) {
        if (formattedEasting >= 0 && formattedEasting <= 700000) {
          response.eastingError = ''
          response.isValid = true
        } else {
          response.eastingError = 'Easting should be between 0 and 700000'
          response.isValid = false
        }
      } else {
        response.eastingError = 'Easting should be a number'
        response.isValid = false
      }
    } else {
      response.eastingError = 'Enter an easting'
      response.isValid = false
    }
    return response
  }
}
