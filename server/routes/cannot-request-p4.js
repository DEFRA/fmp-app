const Joi = require('joi')
const constants = require('../constants')
const { checkParamsForPolygon } = require('../services/shape-utils')

module.exports = {
  method: 'GET',
  path: constants.routes.CANNOT_REQUEST_P4,
  options: {
    handler: async (request, h) => {
      const { encodedPolygon } = request.query
      const { polygon } = checkParamsForPolygon({ encodedPolygon })
      const tryAgainURL = `${constants.routes.RESULTS}?encodedPolygon=${encodeURIComponent(encodedPolygon)}`
      const psoResults = await request.server.methods.getPsoContactsByPolygon(polygon)
      const areaName = psoResults.AreaName || ''
      const psoEmailAddress = psoResults.EmailAddress || ''
      return h.view(constants.views.CANNOT_REQUEST_P4, { tryAgainURL, areaName, psoEmailAddress })
    },
    validate: {
      query: Joi.object().keys({
        encodedPolygon: Joi.string().required()
      })
    }
  }
}
