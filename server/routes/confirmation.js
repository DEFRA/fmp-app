const Joi = require('joi')
const { punctuateAreaName } = require('../services/punctuateAreaName')
const { checkParamsForPolygon } = require('../services/shape-utils')

module.exports = {
  method: 'GET',
  path: '/confirmation',
  options: {
    description: 'Get confirmation page for product 4',
    handler: async (request, h) => {
      const {
        encodedPolygon,
        polygon,
        recipientemail,
        applicationReferenceNumber,
        floodZone
      } = request.query

      const processedPolygonQuery = checkParamsForPolygon(polygon, encodedPolygon)

      const {
        EmailAddress: psoEmailAddress,
        AreaName: areaName,
        LocalAuthorities: localAuthority
      } = await request.server.methods.getPsoContactsByPolygon(processedPolygonQuery.polygonArray)

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
        polygon: Joi.string(),
        encodedPolygon: Joi.string(),
        recipientemail: Joi.string().email().required(),
        applicationReferenceNumber: Joi.string().required(),
        floodZone: Joi.string().required()
      })
        .or('polygon', 'encodedPolygon')
        .messages({
          'object.missing': 'You must include either polygon or encodedPolygon in the query parameters.'
        })
    }
  }
}
