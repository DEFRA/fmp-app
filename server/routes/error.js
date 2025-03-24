const Boom = require('@hapi/boom')
const constants = require('../constants')

module.exports = {
  method: 'GET',
  path: constants.routes.ERROR,
  handler: (_request, _h) => Boom.badImplementation('/error test route')
}
