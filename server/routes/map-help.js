const constants = require('../constants')

module.exports = {
  method: 'GET',
  path: constants.routes.MAP_HELP,
  options: {
    description: 'Map help page',
    handler: async (_request, h) => h.view(constants.views.MAP_HELP)
  }
}
