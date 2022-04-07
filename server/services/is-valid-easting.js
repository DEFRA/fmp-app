module.exports = {
  get: (easting) => {
    const formattedEasting = easting.trim()
    const response = { eastingError: '', isValid: false }
    if (formattedEasting) {
      if (!isNaN(formattedEasting)) {
        if (formattedEasting >= 1 && formattedEasting <= 700000) {
          response.eastingError = ''
          response.isValid = true
        } else {
          response.eastingError = 'Enter an easting in the correct format'
          response.isValid = false
        }
      } else {
        response.eastingError = 'Enter an easting in the correct format'
        response.isValid = false
      }
    } else {
      response.eastingError = 'Enter an easting'
      response.isValid = false
    }
    return response
  }
}
