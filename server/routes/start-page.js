module.exports = {
  method: 'GET',
  path: '/start-page',
  options: {
    description: 'This is landing page',
    auth: {
      strategy: 'restricted'
    }
  },
  handler: async (request, h) => {
    return h.view('start-page')
  }
}
