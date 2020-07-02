
module.exports = [{
  method: 'GET',
  path: '/home',
  options: {
    description: 'That location is not in England',
    auth: {
      strategy: 'restricted'
    },
    handler: async (request, h) => {
      if (typeof request.yar === 'undefined' || typeof request.yar.get('displayError') === 'undefined') {
        return h.view('home')
      } else {
        const errMess = request.yar.get('displayError')
        request.yar.set('displayError', {})
        return h.view('home', errMess)
      }
    }
  }
}, {
  method: 'POST',
  path: '/home',
  options: {
    auth: {
      strategy: 'restricted'
    }
  },
  handler: async (request, h) => {
    return h.redirect('/location')
  }
}]
