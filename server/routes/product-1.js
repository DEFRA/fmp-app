const Boom = require('@hapi/boom')
const Joi = require('joi')
const { getProduct1 } = require('../services/eaMaps/getProduct1')

const MAX_REFERENCE_WIDTH = 25
const SCALE_2500 = 2500
const SCALE_10000 = 10000
const SCALE_25000 = 25000
const SCALE_50000 = 50000

module.exports = {
  method: 'POST',
  path: '/product-1',
  options: {
    description: 'Generate Product 1 PDF',
    handler: async (request, h) => {
      try {
        const {
          polygon,
          scale = SCALE_2500,
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
        reference: Joi.string().allow('').max(MAX_REFERENCE_WIDTH).trim(),
        scale: Joi.number().allow(SCALE_2500, SCALE_10000, SCALE_25000, SCALE_50000).required(),
        polygon: Joi.string().required().allow(''),
        holdingComments: Joi.string().allow('')
      })
    }
  }
}
