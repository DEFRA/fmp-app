const constants = require('../constants')
module.exports = [
  {
    method: 'GET',
    path: constants.routes.HOW_TO_USE_RIVERS_AND_SEA_DATA,
    options: {
      description: 'How to use rivers and sea data page',
      handler: async (_request, h) => h.view(constants.views.HOW_TO_USE_RIVERS_AND_SEA_DATA)
    }
  }
]
