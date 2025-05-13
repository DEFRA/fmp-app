const Joi = require('joi')
const constants = require('../constants')
const emojiRegex = /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]+/gu

const schema = Joi.object({
  fullName: Joi.string().required(),
  recipientemail: Joi.string().email().required()
})

const validatePayload = payload => {
  const { fullName, recipientemail } = payload
  const { error } = schema.validate({ fullName, recipientemail }, { abortEarly: false })
  const errorDetails = error?.details || []

  const errorSummary = errorDetails.map(({ path: [field] }) => {
    const text = field === 'fullName'
      ? 'Enter your full name'
      : 'Enter an email address in the correct format, like name@example.com'
    return { text, href: `#${field}` }
  })

  // Emojis pass hapi's validation, BUT they will cause a difficult to handle crash when we attempt to set them as cookies
  // so they are explicitly rejected here.
  if (recipientemail.match(emojiRegex)) {
    errorSummary.push({ text: 'Emojis are not allowed in the email address', href: '#recipientemail' })
  }

  if (fullName.match(emojiRegex)) {
    errorSummary.push({ text: 'Emojis are not allowed in the name field', href: '#fullName' })
  }
  return { errorSummary }
}

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
        const { errorSummary } = validatePayload(request.payload)
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
