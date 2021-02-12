module.exports = {
  method: 'GET',
  path: '/cookies',
  options: {
    description: 'Cookies Page',
    handler: async (request, h) => {
      return h.view('cookies')
    }
  }
}
