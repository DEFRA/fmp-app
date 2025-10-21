const Joi = require('joi')
const constants = require('../constants')
const { validateContactData } = require('./validateContactData')
const { checkParamsForPolygon } = require('../services/shape-utils')

// NOTE TO SELF JUST CHANGED ALL RESULT PAGE LINK URLS TO ENCODED POLYGON THIS WILL NEED TO BE UPDATED ON ALL PAGES!!

module.exports = [
  {
    method: 'GET',
    path: constants.routes.CONTACT,
    options: {
      description: 'Get contact details page for product 4',
      handler: async (request, h) => {
        const { polygon, encodedPolygon } = request.query
        const processedPolygonQuery = checkParamsForPolygon(polygon, encodedPolygon)
        const backLinkUrl =
          request.headers.referer?.indexOf('/next-steps') > -1 ? `/next-steps?encodedPolygon=${processedPolygonQuery.encodedPolygonParam}` : `/results?encodedPolygon=${processedPolygonQuery.encodedPolygonParam}`
        return h.view(constants.views.CONTACT, {
          processedPolygonQuery,
          ...request.state.p4Customer,
          backLinkUrl
        })
      },
      validate: {
        query: Joi.object({
          polygon: Joi.string(),
          encodedPolygon: Joi.string()
        })
          .or('polygon', 'encodedPolygon') // Require at least one of them
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
        const { polygon, encodedPolygon } = request.payload
        const processedPolygonQuery = checkParamsForPolygon(polygon, encodedPolygon)
        const { errorSummary } = validateContactData(request.payload)
        if (errorSummary.length > 0) {
          return h.view(constants.views.CONTACT, {
            errorSummary,
            processedPolygonQuery,
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
        return h.redirect(`${constants.routes.CHECK_YOUR_DETAILS}?encodedPolygon=${processedPolygonQuery.encodedPolygonParam}&fullName=${fullName}&recipientemail=${recipientemail}`)
      }
    }
  }
]
