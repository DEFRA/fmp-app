module.exports = [{
  method: 'GET',
  path: '/flood-zone-results',
  options: {
    description: 'Displays Flood Zone Three Results Page',
    auth: {
      strategy: 'restricted'
    },
    handler: async (request, h) => {
      return h.view('flood-zone-results')
    }
  }
},
{
  method: 'POST',
  path: '/flood-zone-results',
  options: {
    description: 'Displays Flood Zone Three Results Page',
    auth: {
      strategy: 'restricted'
    }
  },
  handler: async (request, h) => {
    return h.redirect('/contact')
  }
}]
