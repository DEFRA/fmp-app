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
          if (result && result.EmailAddress) {
            model.psoEmailAddress = result.EmailAddress
          }
          if (result && result.AreaName) {
            model.AreaName = result.AreaName
          }
          if (result && result.LocalAuthorities !== undefined && result.LocalAuthorities !== 0) {
            model.LocalAuthorities = result.LocalAuthorities.toString()
          } else {
            model.LocalAuthorities = 'No Data Exists'
          }
          var location = request.query.x + ',' + request.query.y
          if (request.query.zoneNumber) {
            model.zoneNumber = request.query.zoneNumber
          }
          model.location = location
          if (request.query.polygon) {
            model.ispolygon = true
          } else {
            model.ispolygon = false
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
