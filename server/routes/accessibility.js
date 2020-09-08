module.exports = {
  method: 'GET',
  path: '/accessibility',
  options: {
    description: 'Accessibility Page',
    auth: {
      strategy: 'restricted'
    },
    handler: async (request, h) => {
      return h.view('accessibility')
    }
  }
}
