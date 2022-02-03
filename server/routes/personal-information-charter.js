module.exports = {
  method: 'GET',
  path: '/personal-information-charter',
  options: {
    description: 'Privacy policy - Flood map for planning - GOV.UK',
    handler: {
      view: {
        template: 'personal-information-charter',
        context: {
          pageTitle: 'Privacy policy - Flood map for planning - GOV.UK',
          feedback: false,
          metaDescription: 'The Environment Agency uses cookies to collect data about how users browse the site. This page explains what they do and how long they stay on your device.'
        }
      }
    }
  }
}
