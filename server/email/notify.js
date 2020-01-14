const config = require('./../../config')
var NotifyClient = require('notifications-node-client').NotifyClient
var apiKey = config.notifyApiKey
var emailNotifyTemplateId = config.notifyEmailTemplateId
var notifyClient = new NotifyClient(apiKey)
function Email (emailAddress) {
  try {
    notifyClient.sendEmail(emailNotifyTemplateId, emailAddress, {
      reference: 'Postcode Requested'
    }).then().catch(err => console.error(err))
  } catch (error) {
    throw error
  }
}
module.exports = Email
