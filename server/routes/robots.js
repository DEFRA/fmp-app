module.exports = {
  method: 'GET',
  path: '/robots.txt',
  options: {
    auth: {
      strategy: 'restricted'
    },
    handler: {
      file: 'server/public/static/robots.txt'
    }
  }
}
