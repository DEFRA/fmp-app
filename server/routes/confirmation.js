const Boom = require('boom')

module.exports = {
  method: 'GET',
  path: '/confirmation',
  options: {
    description: 'Get confirmation  page for product 4',
    handler: async (request, h) => {
      try {
        return h.view('confirmation')
      } catch (err) {
        return Boom.badImplementation(err.message, err)
      }
    }
  }
}
