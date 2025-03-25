const constants = require('../constants')
module.exports = {
  method: 'GET',
  path: constants.routes.OS_TERMS,
  options: {
    description: 'Get Ordnance Survey terms and conditions',
    handler: {
      view: constants.views.OS_TERMS
    }
  }
}
