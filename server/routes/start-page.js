module.exports = {
  method: 'GET',
  path: '/start-page',
  options: {
    description: 'start-page - Flood Map for Planning - GOV.UK',
    auth: {
      strategy: 'restricted'
    },
    handler: {
      view: {
        template: 'start-page',
        context: {
          pageTitle: 'Flood Map for Planning',
          heading: 'Flood Map for Planning'
        }
      }
    }
  }
}
