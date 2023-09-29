const Joi = require('joi')
const { polygonToArray } = require('../services/shape-utils')
module.exports = [{
  method: 'GET',
  path: '/flood-map',
  options: {
    description: 'Displays a full page map with the Nafra 2 layers',
    handler: async (request, h) => {
      const location = request.query.location
      const polygon = polygonToArray(request.query.polygon)
      const center = request.query.center ? JSON.parse(request.query.center) : []
      return h.view('flood-map', {
        location,
        easting: center[0],
        northing: center[1],
        polygon: JSON.stringify(polygon),
        center: JSON.stringify(center)
      })
    },
    validate: {
      query: Joi.object().keys({
        polygon: Joi.string().required(),
        center: Joi.string().required(),
        location: Joi.string().required()
      })
    }
  }
}]
