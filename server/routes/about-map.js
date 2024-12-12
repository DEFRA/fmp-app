module.exports = [
  {
    method: 'GET',
    path: '/about-map',
    options: {
      description: 'About Map Page',
      handler: async (request, h) => {
        return h.view('about-map')
      }
    }
  }
]
