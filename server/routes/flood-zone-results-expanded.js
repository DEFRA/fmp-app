module.exports = [{
  method: 'GET',
  path: '/flood-zone-results-expanded',
  options: {
    description: 'Displays Flood Zone Results expanded Page',
    auth: {
      strategy: 'restricted'
    },
    handler: async (request, h) => {

      return h.view('flood-zone-results-expanded')
    }
  }
},
{
  method: 'POST',
  path: '/flood-zone-results-expanded',
  options: {
    description: 'Displays Flood Zone Results Expanded Page',
    auth: {
      strategy: 'restricted'
    }
  },
  handler: async (request, h) => {
    return h.redirect('/contact')
  }
}]
