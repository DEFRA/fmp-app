module.exports = [
  {
    method: 'GET',
    path: '/cookies',
    options: {
      description: 'Cookies Page',
      handler: async (request, h) => {
        const { state: cookie } = request
        const accepted = cookie?.GA === 'Accept'
        return h.view('cookies', { accepted })
      }
    }
  }
]
