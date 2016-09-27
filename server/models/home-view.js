var errors = require('./errors.json')

function HomeViewModel (err) {
  this.hasError = !!err
  this.errorMessage = err && errors[err].message
}

module.exports = HomeViewModel
