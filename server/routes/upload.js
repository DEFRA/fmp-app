const constants = require('../constants')
const handlers = {
  get: async (_request, h) => h.view(constants.views.UPLOAD),
}

module.exports = [
  {
    method: 'GET',
    path: constants.routes.UPLOAD,
    options: {
      description: 'Upload Page',
      handler: handlers.get
    }
  }
]
