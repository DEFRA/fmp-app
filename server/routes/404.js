module.exports = [
  {
    method: 'GET',
    path: '/{path*}',
    handler: (_request, h) => {
      return h.view('404').code(404)
    }
  }
]
