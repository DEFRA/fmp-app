
module.exports = [{
  method: 'GET',
  path: '/home',
  options: {
    description: 'Home Page',
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
    description: 'Home Page Post',
    auth: {
      strategy: 'restricted'
    }
  },
  handler: async (request, h) => {
    return h.redirect('/location')
  }
}]
