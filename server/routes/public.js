module.exports = {
  method: 'GET',
  path: '/public/{path*}',
  options: {
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
