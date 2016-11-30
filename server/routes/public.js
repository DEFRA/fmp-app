module.exports = {
  method: 'GET',
  path: '/public/{path*}',
  config: {
    handler: {
      directory: {
        path: [
          'server/public/build',
          'server/public/assets'
        ]
      }
    }
  }
}
