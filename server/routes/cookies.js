module.exports = {
  method: 'GET',
  path: '/cookies',
  options: {
    description: 'Cookies - Flood map for planning - GOV.UK',
    handler: {
      view: {
        template: 'cookies',
        context: {
          pageTitle: 'Cookies - Flood map for planning - GOV.UK',
          heading: 'Flood map for planning',
          metaDescription: 'The Environment Agency uses cookies to collect data about how users browse the site. This page explains what they do and how long they stay on your device.'
        }
      }
    }
  }
}
