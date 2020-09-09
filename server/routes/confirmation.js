const Boom = require('boom')
const ConfirmationViewModel = require('../models/confirmation-view')
const psoContactDetails = require('../services/pso-contact')
const emailConfirm = require('../services/email-confirmation')
module.exports = {
  method: 'GET',
  path: '/confirmation',
  options: {
    description: 'Get confirmation  page for product 4',
    auth: {
      strategy: 'restricted'
    },
    handler: async (request, h) => {
      try {
        if (request.query && request.query.recipientemail && request.query.correlationId && request.query.fullName && request.query.applicationReferenceNumber) {
          const result = await psoContactDetails.getPsoContacts(request.query.x, request.query.y)
          var model = new ConfirmationViewModel(request.query.recipientemail, request.query.applicationReferenceNumber)
          if (result && result.EmailAddress) {
            model.psoEmailAddress = result.EmailAddress
          }
          if (result && result.AreaName) {
            model.AreaName = result.AreaName
          }
          if (result && result.LocalAuthorities !== undefined && result.LocalAuthorities !== 0) {
            model.LocalAuthorities = result.LocalAuthorities.toString()
          } else {
            model.AreaName = 'No Data Exist'
          }
          var location = ''
          if (!request.query.location) {
            location = request.query.x + ',' + request.query.y
          } else {
            location = request.query.location
          }
          await emailConfirm.emailConfirmation(request.query.fullName, request.query.applicationReferenceNumber, location, model.AreaName, model.psoEmailAddress, request.query.recipientemail)
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
