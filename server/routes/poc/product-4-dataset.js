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
                  lastname: Joi.when('type', {
                    is: 'lastname',
                    then: Joi.string().replace(' ', '').required(),
                    otherwise: Joi.strip()
                  }),
                  email: Joi.when('type', {
                    is: 'email',
                    then: Joi.string().replace(' ', '').required(),
                    otherwise: Joi.strip()
                  }),
                  confirmemail: Joi.when('type', {
                    is: 'confirmemail',
                    then: Joi.string().replace(' ', '').required(),
                    otherwise: Joi.strip()
                  }),
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