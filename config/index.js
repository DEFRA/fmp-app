var Joi = require('joi')
var schema = require('./schema')
var config = require('./server.json')

if (config.envVars) {
  var envVars = config.envVars
  for (var key in envVars) {
    // if server.json has a value then override the env var
    envVars[key] = envVars[key] || process.env[key.toUpperCase()]
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
