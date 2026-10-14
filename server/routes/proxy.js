module.exports = [
  {
    method: '*',
    path: '/proxy/{path*}',
    options: {
      payload: {
        output: 'stream',
        parse: false
      },
      handler: {
        proxy: {
          mapUri: (request) => {
            const upstreamPath = request.url.pathname.replace(/^\/proxy/, '') || '/'
            return {
              uri: `http://localhost:3005${upstreamPath}${request.url.search || ''}`
            }
          },
          passThrough: true,
          xforward: true
        }
      }
    }
  }
]
