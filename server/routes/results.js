const Boom = require('boom')

module.exports = {
  method: 'GET',
  path: '/results',
  options: {
    description: 'Get results',
    handler: async (request, h) => {
      try {
        return h.view('results')
      } catch (err) {
        return Boom.badImplementation(err.message, err)
      }
    },
    validate: {
    }
  }
}