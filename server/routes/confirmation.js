const Joi = require('joi')
const { punctuateAreaName } = require('../services/punctuateAreaName')
const { decodePolygon } = require('../services/shape-utils')

module.exports = {
  method: 'GET',
  path: '/confirmation',
  options: {
    description: 'Get confirmation page for product 4',
    handler: async (request, h) => {
      const {
        encodedPolygon,
        recipientemail,
        applicationReferenceNumber,
        floodZone
      } = request.query

      const {
        EmailAddress: psoEmailAddress,
        AreaName: areaName,
        LocalAuthorities: localAuthority
      } = await request.server.methods.getPsoContactsByPolygon(decodePolygon(encodedPolygon))

      const model = {
        recipientemail,
        applicationReferenceNumber: applicationReferenceNumber.replace(/(\w{4})/g, '$1 ').replace(/(^\s+|\s+$)/, ''),
        psoEmailAddress,
        areaName: punctuateAreaName(areaName),
        localAuthority,
        floodZone,
        encodedPolygon
      }
      return h.view('confirmation', model)
    },
    validate: {
      query: Joi.object({
        encodedPolygon: Joi.string().required(),
        recipientemail: Joi.string().email().required(),
        applicationReferenceNumber: Joi.string().required(),
        floodZone: Joi.string().required()
      })
    }
  }
}
