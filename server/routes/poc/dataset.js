const completedPDFData = require('../../../poc/completepdfpage');
const CustomerDetailRequestViewModel = require('../../models/poc/customer-detail-request-view');
const Joi = require('joi')

module.exports = [{
  method: 'GET',
  path: '/poc/dataset',
  options: {
    handler: async (request, h) => {
      return h.view('poc-pdf', new CustomerDetailRequestViewModel());
    }
  }
},
{
  method: 'POST',
  path: '/poc/dataset',
  options: {
    handler: async (request, h) => {
      const { Firstname, Lastname, Email, placeOrPostcode } = request.payload
      await completedPDFData();
      return h.view('pdf-generation-confirmation');
    },

    validate: {
      payload: {
        // type: Joi.string().required().valid('placeOrPostcode', 'firstname', 'lastname', 'email'),
        placeOrPostcode: Joi.string().required(),
        firstname: Joi.string().required().max(50),
        lastname: Joi.string().required().max(50),
        email: Joi.string().required().email().max(100)
      },
      failAction: (request, h, error) => {
        const errors = error.details
        const payload = request.payload || {}
        const model = new CustomerDetailRequestViewModel(payload, errors)
        return h.view('poc-pdf', model).takeover()
      }
    }
  }
}]