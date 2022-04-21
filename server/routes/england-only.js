module.exports = {
  method: 'GET',
  path: '/england-only',
  options: {
    description: 'That location is not in England',
    handler: async (request, h) => {
      const { locationDetails } = request.query
      return h.view('england-only', { locationDetails })
    }
  }
}
