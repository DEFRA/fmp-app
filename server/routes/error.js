const Boom = require('@hapi/boom')

module.exports = {
  method: 'GET',
  path: '/error',
  handler: (request, h) => {
    return Boom.badImplementation('/error test route')
  }
}
