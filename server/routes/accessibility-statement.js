const constants = require('../constants')

module.exports = {
  method: 'GET',
  path: constants.routes.ACCESSIBILITY_STATEMENT,
  options: {
    description: 'Accessibility Page',
    handler: async (_request, h) => h.view(constants.views.ACCESSIBILITY_STATEMENT)
  }
}
