const passwordService = require('../services/snd-password')

module.exports = [
  {
    method: 'GET',
    path: '/login',
    handler: async (request, h) => {
      const { error, url } = request.query

      return h.view('login', { error, url })
    },
    config: { auth: false }
  },
  {
    method: 'POST',
    path: '/login',
    handler: async (request, h) => {
      const { sndPassword, url = '/' } = request.payload
      const isValid = await passwordService.validate(sndPassword)
      if (isValid) {
        return h.redirect(url).state('snd', sndPassword)
      } else {
        return h.redirect(`/login?error=incorrectPassword&url=${encodeURIComponent(url)}`)
      }
    },
    config: { auth: false }
  }
]
