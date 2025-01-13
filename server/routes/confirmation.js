const Boom = require('@hapi/boom')
const { punctuateAreaName } = require('../services/punctuateAreaName')

module.exports = {
  method: 'GET',
  path: '/confirmation',
  options: {
    description: 'Get confirmation page for product 4',
    handler: async (request, h) => {
      try {
        const {
          polygon,
          recipientemail,
          applicationReferenceNumber,
          zoneNumber
        } = request.query

        const {
          EmailAddress: psoEmailAddress,
          AreaName: areaName,
          LocalAuthorities: localAuthority
        } = await request.server.methods.getPsoContactsByPolygon(polygon)

        const model = {
          recipientemail,
          applicationReferenceNumber: applicationReferenceNumber.replace(/(\w{4})/g, '$1 ').replace(/(^\s+|\s+$)/, ''),
          psoEmailAddress,
          AreaName: punctuateAreaName(areaName),
          LocalAuthorities: localAuthority,
          zoneNumber,
          polygon
        }
        return h.view('confirmation', model)
      } catch (err) {
        return Boom.badImplementation(err.message, err)
      }
    }
  }
}
