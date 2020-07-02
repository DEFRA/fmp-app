const Boom = require('boom')
const Joi = require('joi')
const ContactViewModel = require('../models/contact-view')

module.exports = {
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
}