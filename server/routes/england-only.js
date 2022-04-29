module.exports = {
  method: 'GET',
  path: '/england-only',
  options: {
    description: 'That location is not in England',
    handler: async (request, h) => {
      let { locationDetails = '' } = request.query
      const { placeOrPostcode = '', easting, northing, nationalGridReference } = request.query
      const isSearch = !(!placeOrPostcode && !easting && !northing && !nationalGridReference)
      locationDetails = locationDetails.replace(`${placeOrPostcode}, `, '')
      return h.view('england-only', { locationDetails, placeOrPostcode, isSearch })
    }
  }
}
