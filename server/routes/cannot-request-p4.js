const Joi = require('joi')
const constants = require('../constants')

module.exports = {
  method: 'GET',
  path: constants.routes.CANNOT_REQUEST_P4,
  options: {
    handler: (request, h) => {
      const { areaName = '', psoEmailAddress = '' } = request.query
      const tryAgainURL = `/results?encodedPolygon=${request.query.encodedPolygon}`
      return h.view(constants.views.CANNOT_REQUEST_P4, { tryAgainURL, areaName, psoEmailAddress })
    },
    validate: {
      query: Joi.object().keys({
        encodedPolygon: Joi.string().required(),
        areaName: Joi.string().allow(''),
        psoEmailAddress: Joi.string().allow('')
      })
    }
  }
}
