module.exports = [
  {
    method: 'GET',
    path: '/how-to-use-flood-map-for-planning-data',
    options: {
      description: 'How to use flood map for planning data',
      handler: async (_request, h) => h.view('how-to-use-flood-map-for-planning-data')
    }
  }
]
