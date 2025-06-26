const Joi = require('joi')
const emojiRegex = /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]+/gu

const MAX_NAME_LENGTH = 200
const schema = Joi.object({
  fullName: Joi.string().required().max(MAX_NAME_LENGTH),
  recipientemail: Joi.string().email().required()
})

const validateContactData = payload => {
  const { fullName, recipientemail } = payload
  const { error } = schema.validate({ fullName, recipientemail }, { abortEarly: false })
  const errorDetails = error?.details || []
  console.log('errorDetails\n', errorDetails)

  const errorSummary = errorDetails.map(({ path: [field], type }) => {
    const response = { href: `#${field}` }
    if (type === 'string.max') {
      response.text = `Your full name must be less than ${MAX_NAME_LENGTH} characters long`
    } else {
      response.text = field === 'fullName'
        ? 'Enter your full name'
        : 'Enter an email address in the correct format, like name@example.com'
    }
    return response
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

module.exports = { validateContactData }
