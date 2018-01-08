'use strict'
const Boom = require('boom')

module.exports = {
  method: 'GET',
  path: '/error',
  handler: (request, h) => {
    return Boom.badImplementation('/error test route')
  }
}
