const Boom = require('boom')
const config = require('../../config')
const LoginViewModel = require('../models/login-view')

module.exports = [
  {
    method: 'GET',
    path: '/Login',
    options: {
      description: 'Login Get',
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
    path: '/Login',
    options: {
      description: 'Login Post',
      handler: async (request, h) => {
        try {
          var { username, password } = request.payload
          var passwordFromConfig = getPasswordFromUser(username)
          if (passwordFromConfig !== password) {
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

function getPasswordFromUser (username) {
  var credentials = config.credentials
  var entryFound = credentials.find(item => item.username === username)
  if (entryFound) {
    return entryFound.password
  }
}
