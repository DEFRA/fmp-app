const Joi = require('joi')
const constants = require('../constants')
const { validateContactData } = require('./validateContactData')
const { checkParamsForPolygon } = require('../services/shape-utils')

module.exports = [
  {
    method: 'GET',
    path: constants.routes.CONTACT,
    options: {
      description: 'Get contact details page for product 4',
      handler: async (request, h) => {
        const { polygon, encodedPolygon } = checkParamsForPolygon(request.query)
        const backLinkUrl =
          request.headers.referer?.indexOf('/next-steps') > -1 ? `/next-steps?encodedPolygon=${encodedPolygon}` : `/results?encodedPolygon=${encodedPolygon}`
        return h.view(constants.views.CONTACT, {
          encodedPolygon,
          polygon,
          ...request.state.p4Customer,
          backLinkUrl
        })
      },
      validate: {
        query: Joi.object({
          polygon: Joi.string(),
          encodedPolygon: Joi.string()
        })
          .or('polygon', 'encodedPolygon')
          .messages({
            'object.missing': 'You must include either polygon or encodedPolygon in the query parameters.'
          })
      }
    }
  },
  {
    method: 'POST',
    path: constants.routes.CONTACT,
    options: {
      description: 'submits contact details to the check your details page',
      handler: async (request, h) => {
        const { polygon, encodedPolygon } = checkParamsForPolygon(request.payload)
        const { errorSummary } = validateContactData(request.payload)
        if (errorSummary.length > 0) {
          return h.view(constants.views.CONTACT, {
            errorSummary,
            polygon,
            encodedPolygon,
            ...request.payload
          })
        }
        // Store name and email in cookie
        h.state('p4Customer', {
          fullName: request.payload.fullName,
          recipientemail: request.payload.recipientemail
        })
        const fullName = encodeURIComponent(request.payload.fullName)
        const recipientemail = encodeURIComponent(request.payload.recipientemail)
        return h.redirect(`${constants.routes.CHECK_YOUR_DETAILS}?encodedPolygon=${encodedPolygon}&fullName=${fullName}&recipientemail=${recipientemail}`)
      }
    }
  }
]
