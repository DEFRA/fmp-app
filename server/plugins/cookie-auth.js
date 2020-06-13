const HapiAuthCookie = require('hapi-auth-cookie')
exports.plugin = {
  name: 'cookie-auth',
  register: (server, options) => {
    server.register(HapiAuthCookie)
    server.auth.strategy('restricted', 'cookie', {
      cookie: {
        name: 'session',
        password: '$2b$10$IpcDseChL3S19NWfc62vLu00MIW/5y1BiyMCaPQmj2zzX0nhs47k.',
        isSecure: false
      },
      redirectTo: '/'
    })
  }
}
