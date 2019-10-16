const completedPDFData = require('./../../../poc/completepdfpage');
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
                type: Joi.string().required().valid('placeOrPostcode'),
                placeOrPostcode: Joi.when('type', {
                  is: 'placeOrPostcode',
                  then: Joi.string().trim().required(),
                  otherwise: Joi.strip()
                }),
                firstname: Joi.when('type', {
                    is: 'firstname',
                    then: Joi.string().replace(' ', '').required(),
                    otherwise: Joi.strip()
                  }),
            },
            failAction: (request, h, error) => {
                const errors = error.details
                const payload = request.payload || {}
                const model = new CustomerDetailRequestViewModel(payload, errors)
                // https://hapijs.com/api#takeover-response
                // https://github.com/hapijs/hapi/issues/3658 (Lifecycle methods)
                return h.view('poc-pdf', model).takeover()
              }
        }
    }
}]