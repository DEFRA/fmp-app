const constants = require('../constants')
module.exports = {
  method: 'GET',
  path: constants.routes.TERMS_AND_CONDITIONS,
  options: {
    description: 'Terms and conditions - Flood map for planning - GOV.UK',
    handler: {
      view: {
        template: constants.views.TERMS_AND_CONDITIONS,
        context: {
          pageTitle: 'Terms and conditions - Flood map for planning - GOV.UK'
        }
      }
    }
  }
}
