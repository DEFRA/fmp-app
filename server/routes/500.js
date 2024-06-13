module.exports = [
  {
    method: 'GET',
    path: '/{path*}',
    handler: (_request, h) => h.view('500').code(500)
  }
]
