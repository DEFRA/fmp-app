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
          const StoredUsername = Users[0].username
          const StoredPassword = Users[0].password

          if (username !== StoredUsername && password !== StoredPassword) {
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
