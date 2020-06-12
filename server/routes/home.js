module.exports = {
  method: 'GET',
  path: '/home',
  options: {
    auth: {
      strategy: 'restricted'
    },
    handler: (request, h) => {
      return h.view('home')
    }
  }
}
