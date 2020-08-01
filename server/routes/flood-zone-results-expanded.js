module.exports = [{
  method: 'GET',
  path: '/flood-zone3-results-expanded',
  options: {
    description: 'Displays Flood Zone Three Results expanded Page',
    auth: {
      strategy: 'restricted'
    },
    handler: async (request, h) => {

      return h.view('flood-zone3-results-expanded')
    }
  }
},
{
  method: 'POST',
  path: '/flood-zone3-results-expanded',
  options: {
    description: 'Displays Flood Zone Three Results Expanded Page',
    auth: {
      strategy: 'restricted'
    }
  },
  handler: async (request, h) => {
    return h.redirect('/contact')
  }
}]
