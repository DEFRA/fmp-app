const Boom = require('boom')
const ConfirmationViewModel = require('../models/confirmation-view')
const pdfService = require('./../services/pdf-service')
const psoContactDetails = require('../services/pso-contact')
const emailConfirm = require('../services/email-confirmation')
module.exports = {
  method: 'GET',
  path: '/confirmation',
  options: {
    description: 'Get confirmation  page for product 4',
    handler: async (request, h) => {
      try {
        if (request.query && request.query.email && request.query.correlationId && request.query.fullName && request.query.applicationReferenceNumber) {
          const result = await psoContactDetails.getPsoContacts(request.query.x, request.query.y)
          var model = new ConfirmationViewModel(request.query.email, request.query.applicationReferenceNumber)
          if (result && result.EmailAddress) {
            model.EmailAddress = result.EmailAddress
          }
          if (result && result.AreaName) {
            model.AreaName = result.AreaName
          }
          if (result && result.LocalAuthorities !== undefined && result.LocalAuthorities !== 0) {
            model.LocalAuthorities = result.LocalAuthorities.toString()
          } else {
            model.AreaName = 'No Data Exist'
          }
          if (request.query && request.query.x && request.query.y) {
            try {
              pdfService.get(request.query.x, request.query.y)
            } catch (error) {
              // await util.LogMessage(`${error.message}`, '', `${request.query.correlationId}`)
              throw error
            }
          } else {
            // await util.LogMessage(`Error occured in getting x, y and correlationId`, '', `${request.query.correlationId}`)
            return Boom.badImplementation('Error occured in getting the x and y co-ordinates')
          }
          await emailConfirm.emailConfirmation(request.query.fullName, 'lastname', request.query.applicationReferenceNumber, request.query.x, request.query.y, model.AreaName, model.EmailAddress, request.query.email)
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
