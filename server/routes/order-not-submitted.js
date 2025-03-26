const Joi = require('joi')
const constants = require('../constants')
module.exports = {
  method: 'GET',
  path: constants.routes.ORDER_NOT_SUBMITTED,
  options: {
    handler: (request, h) => h.view(constants.views.ORDER_NOT_SUBMITTED, { tryAgainURL: `/results?polygon=${request.query.polygon}` }),
    validate: {
      query: Joi.object().keys({
        polygon: Joi.string().required()
      })
    }
  }
}
