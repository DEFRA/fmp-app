const CookieViewModel = require('../models/cookie-view')
module.exports = [{
  method: 'GET',
  path: '/cookies',
  options: {
    description: 'Cookies Page',
    handler: async (request, h) => {
      var errors = []
      var model = new CookieViewModel({
        errorSummary: errors
      })
      var header = h.response
      var cookie = request.state
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
},
{
  method: 'POST',
  path: '/cookies',
  options: {
    description: 'Cookies'
  },
  handler: async (request, h) => {
    var updateCookie = request.state
    var errors = []
    var model = new CookieViewModel({
      errorSummary: errors
    })
    if (request !== null && request.payload !== null & request.payload.cookie_consent !== null) {
      if (request.payload.cookie_consent === 'yes') {
        if (updateCookie) {
          updateCookie.GA = 'Accept'
          model.isNoChecked = false
          model.isYesChecked = true
        }
      }
      if (request.payload.cookie_consent === 'no') {
        updateCookie.GA = 'Reject'
        model.isNoChecked = true
        model.isYesChecked = false
      }
    }
    return h.redirect('/cookies', model)
  }
}]
