const Joi = require('joi')
const constants = require('../constants')

module.exports = {
  method: 'GET',
  path: constants.routes.CANNOT_REQUEST_P4,
  options: {
    handler: (request, h) => {
      const { areaName = '', psoEmailAddress = '' } = request.query
      const tryAgainURL = `${constants.routes.RESULTS}?encodedPolygon=${encodeURIComponent(request.query.encodedPolygon)}`
      return h.view(constants.views.CANNOT_REQUEST_P4, { tryAgainURL, areaName, psoEmailAddress })
    },
    validate: {
      query: Joi.object().keys({
        encodedPolygon: Joi.string().required(),
        areaName: Joi.string().max(100).allow(''),
        psoEmailAddress: Joi.string().email({ tlds: { allow: false } }).pattern(/@environment-agency\.gov\.uk$/i).allow('')
      })
    }
  }
}
