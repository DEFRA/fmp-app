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
          var model = new ConfirmationViewModel(request.query.recipientemail, request.query.applicationReferenceNumber, '', '', '', '', request.query.x, request.query.y, request.query.polygon, request.query.cent, request.query.location)
          model.location = request.query.x + ',' + request.query.y
          model.psoEmailAddress = (result && result.EmailAddress) ? result.EmailAddress : undefined
          model.AreaName = (result && result.AreaName) ? result.AreaName : undefined
          model.LocalAuthorities = (result && result.LocalAuthorities !== undefined && result.LocalAuthorities !== 0) ? result.LocalAuthorities : undefined
          model.zoneNumber = (request.query.zoneNumber) ? request.query.zoneNumber : undefined
          model.ispolygon = (request.query.polygon) ? true : false
          await emailConfirm.emailConfirmation(request.query.fullName, request.query.applicationReferenceNumber, model.location, model.AreaName, model.psoEmailAddress, request.query.recipientemail)
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
