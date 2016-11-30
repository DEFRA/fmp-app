module.exports = {
  method: 'GET',
  path: '/robots.txt',
  config: {
    handler: {
      file: 'server/public/static/robots.txt'
    }
  }
}
