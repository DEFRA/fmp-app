module.exports = [
  {
    method: 'GET',
    path: '/order-not-submitted',
    handler: (request, h) => {
      const { polygon, error } = request.query
      const tryAgainURL = `/results?polygon=${polygon}`
      return h.view('order-not-submitted', { tryAgainURL, error }).code(200)
    }
  }
]
