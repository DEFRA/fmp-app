module.exports = {
  method: 'GET',
  path: '/location',
  options: {
    description: 'Get location page to input location',
    handler: async (request, h) => {
      return h.view('location')
    }
  }
}
