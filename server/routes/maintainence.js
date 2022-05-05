module.exports = {
  method: 'GET',
  path: '/{path*}',
  options: {
    handler: (request, h) => {
      return h.view('maintainence')
    }
  }
}
