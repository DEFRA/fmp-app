'use strict'
module.exports = {
  method: 'GET',
  path: '/os-terms',
  config: {
    description: 'Get Ordnance Survey terms and conditions',
    handler: {
      view: 'os-terms'
    }
  }
}
