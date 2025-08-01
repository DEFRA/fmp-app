const Joi = require('joi')
const constants = require('../constants')
const { validateContactData } = require('./validateContactData')

module.exports = [
  {
    method: 'GET',
    path: constants.routes.CONTACT,
    options: {
      description: 'Get contact details page for product 4',
      handler: async (request, h) => {
        const backLinkUrl = request.headers.referer?.indexOf('/next-steps') > -1 ? `/next-steps?polygon=${request.query.polygon}` : `/results?polygon=${request.query.polygon}`
        return h.view(constants.views.CONTACT, {
          polygon: request.query.polygon,
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
        const { errorSummary } = validateContactData(request.payload)
        if (errorSummary.length > 0) {
          return h.view(constants.views.CONTACT, {
            errorSummary,
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
        return h.redirect(`${constants.routes.CHECK_YOUR_DETAILS}?polygon=${request.payload.polygon}&fullName=${fullName}&recipientemail=${recipientemail}`)
      }
    }
  }
]
