module.exports = {
  method: 'GET',
  path: '/terms-conditions',
  options: {
    description: 'Terms and conditions - Flood map for planning - GOV.UK',
    handler: {
      view: {
        template: 'terms-and-conditions',
        context: {
          pageTitle: 'Terms and conditions - Flood map for planning - GOV.UK',
          feedback: false,
          metaDescription: 'The Environment Agency uses cookies to collect data about how users browse the site. This page explains what they do and how long they stay on your device.'
        }
      }
    }
  }
}
