module.exports = {
  method: 'GET',
  path: '/location',
  options: {
    auth: {
      strategy: 'restricted'
    }
  },
  handler: async (request, h) => {
    return h.view('location')
  }
}
