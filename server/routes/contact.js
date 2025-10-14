const Joi = require('joi')
const constants = require('../constants')
const { validateContactData } = require('./validateContactData')
const { decodePolygon } = require('../services/shape-utils')

module.exports = [
  {
    method: 'GET',
    path: constants.routes.CONTACT,
    options: {
      description: 'Get contact details page for product 4',
      handler: async (request, h) => {
        const polygon = request.query.polygon
        const decodedPolygon = decodePolygon(polygon)
        const backLinkUrl = request.headers.referer?.indexOf('/next-steps') > -1 ? `/next-steps?polygon=${polygon}` : `/results?polygon=${polygon}`
        return h.view(constants.views.CONTACT, {
          decodedPolygon,
          polygon,
          ...request.state.p4Customer,
          backLinkUrl
        })
      },
      validate: {
        query: Joi.object({
          polygon: Joi.string().required()
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
        const polygon = request.payload.polygon
        const decodedPolygon = decodePolygon(polygon)
        const { errorSummary } = validateContactData(request.payload)
        if (errorSummary.length > 0) {
          return h.view(constants.views.CONTACT, {
            errorSummary,
            decodedPolygon,
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
        return h.redirect(`${constants.routes.CHECK_YOUR_DETAILS}?polygon=${polygon}&fullName=${fullName}&recipientemail=${recipientemail}`)
      }
    }
  }
]
