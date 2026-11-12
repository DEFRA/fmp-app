module.exports = {
  method: 'GET',
  path: '/map/refresh',
  options: {
    description: 'Refreshes the fmp cookie used for proxy requests (the cookie is set by the fmp-cookie plugin)',
    handler: (_request, h) => h.response().code(204)
  }
}
