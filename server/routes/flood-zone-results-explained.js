module.exports = [
  {
    method: 'GET',
    path: '/flood-zone-results-explained',
    options: {
      description: 'Displays Flood Zone Results expanded Page',
      handler: async (request, h) =>
        h.view('flood-zone-results-explained', { zone: encodeURIComponent(request.query.zone) })
    }
  }
]
