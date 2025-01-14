const cyltfriUrl = 'https://www.gov.uk/check-long-term-flood-risk'

const routes = {
  'about-map': '/about-map',
  'buy-sell': cyltfriUrl,
  'flood-history': 'https://www.gov.uk/request-flooding-history',
  insurance: cyltfriUrl,
  other: 'https://www.gov.uk/browse/environment-countryside/flooding-extreme-weather'
}

const handlers = {
  get: async (_request, h) => h.view('triage'),
  post: async (request, h) => h.redirect(routes[request.payload.triageOptions] || '/about-map')
}

module.exports = [
  {
    method: 'GET',
    path: '/triage',
    options: {
      description: 'Triage Page',
      handler: handlers.get
    }
  },
  {
    method: 'POST',
    path: '/triage',
    handler: handlers.post
  }
]
