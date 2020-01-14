const Boom = require('boom')
const notifyEmailClient = require('./../email/notify')
module.exports = {
  method: 'GET',
  path: '/confirmation',
  options: {
    description: 'Get confirmation  page for product 4',
    handler: async (request, h) => {
      try {
        if (request.query && request.query.email) {
          notifyEmailClient(request.query.email)
        } else {
          return Boom.badImplementation('Error occured in getting the email address')
        }
        return h.view('confirmation')
      } catch (err) {
        return Boom.badImplementation(err.message, err)
      }
    }
  }
}
