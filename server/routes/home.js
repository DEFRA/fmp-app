const { config } = require('../../config')
const { homePageRedirectUrl } = config

module.exports = [
  {
    method: 'GET',
    path: '/',
    options: {
      description: 'Home Page',
      handler: async (request, h) => {
        if (homePageRedirectUrl) {
          return h.redirect(homePageRedirectUrl).permanent()
        }
        return h.view('home')
      }
    }
  }
]
