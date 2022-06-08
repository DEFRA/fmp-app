const maintenanceRouteHandler = (_request, h) => h.view('maintainence')

module.exports = [
  {
    method: 'GET',
    path: '/maintenance',
    handler: maintenanceRouteHandler
  },
  {
    method: 'GET',
    path: '/maintainence',
    handler: maintenanceRouteHandler
  }
]
