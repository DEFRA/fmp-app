const Boom = require('boom')
const ConfirmationViewModel = require('../models/confirmation-view')
const notifyEmailClient = require('./../email/notify')
const pdfService = require('./../services/pdf-service')
const util = require('../util')
module.exports = {
  method: 'GET',
  path: '/confirmation',
  options: {
    description: 'Get confirmation  page for product 4',
    handler: async (request, h) => {
      try {
        if (request.query && request.query.email && request.query.correlationId) {
          // await util.LogMessage(`Calling Email Service`,'',`${request.query.correlationId}`)
          notifyEmailClient(request.query.email)
          // await util.LogMessage(`Called Email Service`,'',`${request.query.correlationId}`)
          var model = new ConfirmationViewModel(request.query.email, request.query.applicationReferenceNumber)
          if (request.query && request.query.x && request.query.y) {
            try {
              pdfService.get(request.query.x, request.query.y)
            } catch (error) {
              // await util.LogMessage(`${error.message}`,'',`${request.query.correlationId}`)
              throw error
            }
          } else {
            // await util.LogMessage(`Error occured in getting x, y and correlationId`,'',`${request.query.correlationId}`)
            return Boom.badImplementation('Error occured in getting the x and y co-ordinates')
          }
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
