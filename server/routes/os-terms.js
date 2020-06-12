module.exports = {
  method: 'GET',
  path: '/os-terms',
  options: {
    description: 'Get Ordnance Survey terms and conditions',
    auth: {
      strategy: 'restricted'
    },
    handler: {
      view: 'os-terms'
    }
  }
}
