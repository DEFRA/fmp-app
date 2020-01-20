const Boom = require('boom')
const EmailConfirmationViewModel = require('./../models/email-confirmation-view')
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
          var model = new EmailConfirmationViewModel(request.query.email)
          return h.view('confirmation', model)
        } else {
          return Boom.badImplementation('Error occured in getting the email address')
        }
      } catch (err) {
        return Boom.badImplementation(err.message, err)
      }
    }
  }
}
