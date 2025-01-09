module.exports = [
  {
    method: 'GET',
    path: '/about-map',
    options: {
      description: 'About Map Page',
      handler: async (request, h) => {
        const cookies = request.state
        const skipAboutMapPage = (cookies['Skip-changes-to-flood-data'] === 'true')
        if (skipAboutMapPage) {
          return h.redirect('/location')
        }
        return h.view('about-map')
      }
    }
  }
]
