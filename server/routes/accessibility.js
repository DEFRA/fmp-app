module.exports = {
  method: 'GET',
  path: '/accessibility',
  options: {
    description: 'Accessibility - Flood map for planning - GOV.UK',
    handler: {
      view: {
        template: 'accessibility',
        context: {
          pageTitle: 'Accessibility - Flood map for planning - GOV.UK',
          heading: 'Flood map for planning',
          metaDescription: 'The Environment Agency Accessibility Statement'
        }
      }
    }
  }
}
