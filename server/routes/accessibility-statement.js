module.exports = {
  method: 'GET',
  path: '/accessibility-statement',
  options: {
    description: 'Accessibility Page',
    handler: async (request, h) => {
      return h.view('accessibility-statement')
    }
  }
}
