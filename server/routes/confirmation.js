const Boom = require('@hapi/boom')
const ConfirmationViewModel = require('../models/confirmation-view')
const { punctuateAreaName } = require('../services/punctuateAreaName')

module.exports = {
  method: 'GET',
  path: '/confirmation',
  options: {
    description: 'Get confirmation  page for product 4',
    handler: async (request, h) => {
      try {
        if (request.query.recipientemail && request.query.fullName && request.query.applicationReferenceNumber && request.query.location) {
          const result = await request.server.methods.getPsoContactsByPolygon(request.query.polygon)
          const model = new ConfirmationViewModel(request.query.recipientemail, request.query.applicationReferenceNumber, '', '', '', '', request.query.x, request.query.y, request.query.polygon, request.query.cent, request.query.location, '')
          model.location = request.query.x + ',' + request.query.y
          model.psoEmailAddress = (result && result.EmailAddress) ? result.EmailAddress : undefined
          model.AreaName = (result && result.AreaName) ? punctuateAreaName(result.AreaName) : undefined
          model.LocalAuthorities = (result && result.LocalAuthorities) ? result.LocalAuthorities : undefined
          model.zoneNumber = (request.query.zoneNumber) ? request.query.zoneNumber : undefined
          model.ispolygon = !!(request.query.polygon)
          model.search = request.query.location

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
