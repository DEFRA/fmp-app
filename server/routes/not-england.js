const Joi = require('joi')

module.exports = {
  method: 'GET',
  path: '/not-england',
  options: {
    description: 'That location is not in England',
    auth: {
      strategy: 'restricted'
    },
    handler: async (request, h) => {
      return h.view('not-england')
    }
  }
}
