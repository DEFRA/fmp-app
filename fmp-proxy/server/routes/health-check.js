module.exports = {
  method: 'GET',
  path: '/health-check',
  options: {
    description: 'Health endpoint for fmp-proxy',
    auth: false,
    handler: () => ({
      ok: true,
      service: 'fmp-proxy'
    })
  }
}
