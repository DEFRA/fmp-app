const Boom = require('boom')
const config = require('../../config')
const LoginViewModel = require('../models/login-view')
const Users = require('./../user')
const Bcrypt = require('bcrypt')

module.exports = [
  {
    method: 'GET',
    path: '/',
    options: {
      handler: async (request, h) => {
        if (config.maintainence) {
          return h.view('maintainence')
        }
        return h.view('login', new LoginViewModel())
      }
    }
  },
  {
    method: 'POST',
    path: '/',
    options: {
      handler: async (request, h) => {
        try {
          const { username, password } = request.payload
          const user = Users[username]

          if (!user || !await Bcrypt.compare(password, user.password)) {
            return h.view('login')
          }
          request.cookieAuth.set({ username })
          return h.redirect('home')
        } catch (err) {
          return Boom.badImplementation(err.message, err)
        }
      }
    }
  }
]
