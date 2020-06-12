module.exports = {
  method: 'GET',
  path: '/privacy-policy',
  options: {
    description: 'Privacy policy - Flood map for planning - GOV.UK',
    auth: {
      strategy: 'restricted'
    },
    handler: {
      view: {
        template: 'privacy-policy',
        context: {
          pageTitle: 'Privacy policy - Flood map for planning - GOV.UK',
          feedback: false,
          metaDescription: 'The Environment Agency uses cookies to collect data about how users browse the site. This page explains what they do and how long they stay on your device.'
        }
      }
    }
  }
}
