const config = require('./../../config')
var NotifyClient = require('notifications-node-client').NotifyClient
var apiKey = config.notifyApiKey
var emailNotifyTemplateId = config.notifyEmailTemplateId
var notifyClient = new NotifyClient(apiKey)
function Email (emailAddress) {
  try {
    notifyClient.sendEmail(emailNotifyTemplateId, emailAddress, {
      personalisation: {
        'first_name': 'Amala',
        'application_number': '300241'
      },
      reference: 'Postcode Requested'
    }).then(response => console.log(response)).catch(err => console.error(err))
  } catch (error) {
    throw error
  }
}
module.exports = Email
