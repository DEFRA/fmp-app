const constants = require('../constants')

module.exports = {
  method: 'GET',
  path: constants.routes.ENGLAND_ONLY,
  options: {
    description: 'That location is not in England',
    handler: async (request, h) => {
      let { locationDetails = '' } = request.query
      const { placeOrPostcode = '', easting, northing, nationalGridReference } = request.query
      const isSearch = !(!placeOrPostcode && !easting && !northing && !nationalGridReference)
      locationDetails = locationDetails.replace(new RegExp(`^${placeOrPostcode}, `, 'i'), '')
      return h.view('england-only', { locationDetails, placeOrPostcode, isSearch })
    }
  }
}
