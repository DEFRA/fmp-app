module.exports = [
  {
    method: 'GET',
    path: '/order-not-submitted',
    handler: (request, h) => {
      const { polygon, center, location, error } = request.query
      const tryAgainURL = `/flood-zone-results?polygon=${polygon}&center=${center}&location=${location}`
      return h.view('order-not-submitted', { tryAgainURL, error }).code(200)
    }
  }
]
