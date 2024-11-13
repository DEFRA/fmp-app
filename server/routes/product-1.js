const Boom = require('@hapi/boom')
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
        const message = (err && err.message) || 'An error occured during PDF generation'
        return Boom.badImplementation(message, err)
      }
    }
  }
}
