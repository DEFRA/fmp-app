const Boom = require('boom')
const ContactViewModel = require('../models/contact-view')
const QueryString = require('querystring')

module.exports = [
  {
    method: 'GET',
    path: '/contact',
    options: {
      description: 'Get contact details page for product 4',
      handler: async (request, h) => {
        try {
          const email = request.query.email
          if (email) {
            return h.view('contact', new ContactViewModel(
              {
                fullName: '',
                email: email
              }))
          }
          const model = new ContactViewModel()
          return h.view('contact', model)
        } catch (err) {
          return Boom.badImplementation(err.message, err)
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/contact',
    options: {
      handler: async (request, h) => {
        const payload = request.payload
        let queryParams = {}
        queryParams.email = payload.email
        const query = QueryString.stringify(queryParams)
        return h.redirect(`/confirmation?${query}`)
      }
    }
  }]
