const Joi = require('joi')

module.exports = {
  method: 'GET',
  path: '/not-england',
  options: {
    description: 'That location is not in England',
    auth: {
      strategy: 'restricted'
    },
    handler: async (request, h) => {
      return h.view('not-england')
    },
    validate: {
      query: {
        placeOrPostcode: Joi.string(),
        nationalGridReference: Joi.string(),
        easting: Joi.number().required(),
        northing: Joi.number().required(),
        centroid: Joi.boolean()
      }
    }
  }
}
