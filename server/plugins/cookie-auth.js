const HapiAuthCookie = require('hapi-auth-cookie')
exports.plugin = {
  name: 'cookie-auth',
  register: (server, options) => {
    server.register(HapiAuthCookie)
    server.auth.strategy('restricted', 'cookie', {
      cookie: {
        name: 'session',
        password: 'product4product4product4product4',
        isSecure: false
      },
      redirectTo: '/'
    })
  }
}
