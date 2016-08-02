var Joi = require('joi')
var schema = require('./schema')
var config = require('./server.json')

if (config.environmentVariables != null) {
  var envVariables = config.environmentVariables
  for (var key in envVariables) {
    envVariables[key] = process.env[key.toUpperCase()]
  }
}

Joi.validate(config, schema, function (err, value) {
  if (err) {
    throw new Error('The server config is invalid. ' + err.message)
  }
  // Update config with validated object
  config = value
})

module.exports = config
