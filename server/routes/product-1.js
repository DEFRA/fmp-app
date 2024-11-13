const Boom = require('@hapi/boom')
const Joi = require('joi')
const { getProduct1 } = require('../services/eaMaps/getProduct1')

module.exports = {
  method: 'POST',
  path: '/product-1',
  options: {
    description: 'Generate Product 1 PDF',
    handler: async (request, h) => {
      try {
        const {
          polygon,
          scale = 2500,
          reference = '<Unspecified>'
        } = request.payload
        const holdingComments = request.payload.holdingComments === 'true'

        const product1 = await getProduct1(polygon, reference, scale, holdingComments)
        const date = new Date().toISOString()
        return h
          .response(product1)
          .encoding('binary')
          .type('application/pdf')
          .header('content-disposition', `attachment; filename=flood-map-planning-${date}.pdf;`)
          .header('X-XSS-Protection', '1; mode=block')
      } catch (err) {
        const message = err.message
        console.log('error caught in product-1 route', err.message)
        return Boom.badImplementation(message, err)
      }
    },
    validate: {
      payload: Joi.object().keys({
        reference: Joi.string().allow('').max(25).trim(),
        scale: Joi.number().allow(2500, 10000, 25000, 50000).required(),
        polygon: Joi.string().required().allow(''),
        holdingComments: Joi.string().allow('')
      })
    }
  }
}
