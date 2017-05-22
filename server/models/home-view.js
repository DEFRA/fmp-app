var errors = require('./errors.json')

function HomeViewModel (err, place) {
  this.hasError = !!err
  this.errorMessage = err && errors[err].message
  this.place = place || ''
}

module.exports = HomeViewModel
