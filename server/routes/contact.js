const Boom = require('boom')
const ContactViewModel = require('../models/contact-view')
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const nameRegex = /[a-zA-Z][a-zA-Z ]+[a-zA-Z]$/
module.exports = [{
  method: 'GET',
  path: '/contact',
  options: {
    description: 'Get contact details page for product 4',
    handler: async (request, h) => {
      try {
        const model = new ContactViewModel()
        return h.view('contact', model)
      } catch (err) {
        return Boom.badImplementation(err.message, err)
      }
    },
    validate: {
    }
  }
},
{
  method: 'POST',
  path: '/contact',
  options: {
    description: 'submits the page to Confirmation Screen',
    auth: {
      strategy: 'restricted'
    },
    handler: async (request, h) => {
      try {
        let model = {}
        const { email, fullname } = request.payload
        const isEmailFormatValid = emailRegex.test(email)
        const isNameFormatValid = nameRegex.test(fullname)
        if (email.trim() !== '' && isEmailFormatValid && fullname.trim() !== '' && isNameFormatValid) {
          return h.view('confirmation')
        } else if (email && email.trim() !== '' && isEmailFormatValid) {
          const errors = [{ text: 'Please enter valid fullname', href: '#fullname' }]
          model = {}
          model = new ContactViewModel({
            errorSummary: errors,
            fullname: fullname,
            email: email,
            fullnameError: { text: 'Please enter valid fullname' }
          })
        } else if (fullname && fullname.trim() !== '' && isNameFormatValid) {
          const errors = [{ text: 'Please enter valid email', href: '#email' }]
          model = {}
          model = new ContactViewModel({
            errorSummary: errors,
            fullname: fullname,
            email: email,
            emailError: { text: 'Please enter valid email' }
          })
        } else {
          const errors = [{ text: 'Please enter valid name', href: '#fullname' },
            { text: 'Please enter valid email', href: '#email' }
          ]
          model = {}
          model = new ContactViewModel({
            errorSummary: errors,
            fullname: fullname,
            email: email,
            emailError: { text: 'Please enter valid email' },
            fullnameError: { text: 'Please enter valid fullname' }
          })
        }
        return h.view('contact', model)
      } catch (error) {

      }
    }
  }
}]
