function cookiesModel (updated, referer = '', cookiesPolicy = {}) {
  return {
    analytics: {
      idPrefix: 'analytics',
      name: 'analytics',
      fieldset: {
        legend: {
          text: 'Do you want to accept analytics cookies?',
          classes: 'govuk-fieldset__legend--s'
        }
      },
      items: [
        {
          value: true,
          text: 'Yes',
          checked: cookiesPolicy.analytics
        },
        {
          value: false,
          text: 'No',
          checked: !cookiesPolicy.analytics
        }
      ]
    },
    updated,
    referer
  }
}

module.exports = { cookiesModel }
