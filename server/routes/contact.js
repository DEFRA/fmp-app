const Joi = require('joi')
const constants = require('../constants')
const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const nameRegex = /[a-zA-Z][a-zA-Z ]+[a-zA-Z]$/

const validatePayload = payload => {
  const errorSummary = []
  // validate Name
  if (payload.fullName.length === 0 || !nameRegex.test(payload.fullName.trim())) {
    errorSummary.push({
      text: 'Enter your full name',
      href: '#fullName'
    })
  }
  if (payload.recipientemail.length === 0 || !emailRegex.test(payload.recipientemail.trim())) {
    errorSummary.push({
      text: 'Enter an email address in the correct format, like name@example.com',
      href: '#recipientemail'
    })
  }
  return {
    errorSummary
  }
}

module.exports = [
  {
    method: 'GET',
    path: constants.routes.CONTACT,
    options: {
      description: 'Get contact details page for product 4',
      handler: async (request, h) => {
        return h.view(constants.views.CONTACT, { polygon: request.query.polygon })
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
        const { errorSummary } = validatePayload(request.payload)
        if (errorSummary.length > 0) {
          return h.view(constants.views.CONTACT, {
            errorSummary,
            ...request.payload
          })
        }
        return h.redirect(`${constants.routes.CHECK_YOUR_DETAILS}?polygon=${request.payload.polygon}&fullName=${request.payload.fullName}&recipientemail=${request.payload.recipientemail}`)
      }
    }
  }
]
