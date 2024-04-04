const CookieViewModel = require('../models/cookie-view')
module.exports = [
  {
    method: 'GET',
    path: '/cookies',
    options: {
      description: 'Cookies Page',
      handler: async (request, h) => {
        const errors = []
        const model = new CookieViewModel({
          errorSummary: errors
        })
        const cookie = request.state
        if (cookie !== null && cookie.GA !== null && cookie.GA === 'Accept') {
          model.isYesChecked = true
          model.isNoChecked = false
        } else if (cookie !== null && cookie.GA !== null && cookie.GA === 'Reject') {
          model.isNoChecked = true
          model.isYesChecked = false
        } else {
          model.isNoChecked = false
          model.isYesChecked = false
        }
        return h.view('cookies', model)
      }
    }
  }
]
