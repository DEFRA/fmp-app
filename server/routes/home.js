
module.exports = [{
  method: 'GET',
  path: '/',
  options: {
    description: 'Home Page',
    handler: async (request, h) => {
      if (typeof request.yar === 'undefined' || typeof request.yar.get('displayError') === 'undefined') {
        // return h.view('home', { allowRobots: true, headers: JSON.stringify(request.headers) })
        const headers = JSON.stringify(request.headers)
        // console.log('\nhome\ Request.headers', request.headers)
        // console.log('\nhome\ Request.headers Stringified', headers)
        return h.view('home', { allowRobots: true, headers: encodeURIComponent(headers) })
      } else {
        const errMess = request.yar.get('displayError')
        request.yar.set('displayError', {})
        return h.view('home', errMess)
      }
    }
  }
}, {
  method: 'POST',
  path: '/',
  options: {
    description: 'Home Page Post'
  },
  handler: async (request, h) => {
    return h.redirect('/location')
  }
}]
