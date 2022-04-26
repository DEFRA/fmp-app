module.exports = {
  method: 'GET',
  path: '/england-only',
  options: {
    description: 'That location is not in England',
    handler: async (request, h) => {
      let { locationDetails = '' } = request.query
      const { placeOrPostcode = '' } = request.query
      locationDetails = locationDetails.replace(`${placeOrPostcode}, `, '')
      return h.view('england-only', { locationDetails, placeOrPostcode })
    }
  }
}
