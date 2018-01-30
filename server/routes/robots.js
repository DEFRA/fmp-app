module.exports = {
  method: 'GET',
  path: '/robots.txt',
  options: {
    handler: {
      file: 'server/public/static/robots.txt'
    }
  }
}
