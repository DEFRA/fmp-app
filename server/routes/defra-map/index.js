module.exports = [
  {
    method: 'GET',
    path: '/map',
    options: {
      description: 'a POC page to display the map component',
      handler: async (_request, h) => {
        return h.view('map')
      }
    }
  }
]
