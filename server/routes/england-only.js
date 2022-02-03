module.exports = {
  method: 'GET',
  path: '/england-only',
  options: {
    description: 'That location is not in England',
    handler: async (request, h) => {
      return h.view('england-only')
    }
  }
}
