module.exports = [
  {
    method: 'GET',
    path: '/{path*}',
    handler: (_request, h) => h.view('404').code(404)
  }
]
