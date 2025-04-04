const Joi = require('joi')
const { punctuateAreaName } = require('../services/punctuateAreaName')

module.exports = {
  method: 'GET',
  path: '/confirmation',
  options: {
    description: 'Get confirmation page for product 4',
    handler: async (request, h) => {
      const {
        polygon,
        recipientemail,
        applicationReferenceNumber,
        zoneNumber
      } = request.query

      const {
        EmailAddress: psoEmailAddress,
        AreaName: areaName,
        LocalAuthorities: localAuthority
      } = await request.server.methods.getPsoContactsByPolygon(polygon)

      const model = {
        recipientemail,
        applicationReferenceNumber: applicationReferenceNumber.replace(/(\w{4})/g, '$1 ').replace(/(^\s+|\s+$)/, ''),
        psoEmailAddress,
        areaName: punctuateAreaName(areaName),
        localAuthority,
        zoneNumber,
        polygon
      }
      return h.view('confirmation', model)
    },
    validate: {
      query: Joi.object({
        polygon: Joi.string().required(),
        recipientemail: Joi.string().email().required(),
        applicationReferenceNumber: Joi.string().required(),
        zoneNumber: Joi.string().required()
      })
    }
  }
}
