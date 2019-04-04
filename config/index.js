const Joi = require('joi')
const schema = require('./schema')
const config = require('./server.json')

// Validate config
const result = Joi.validate(config, schema, { abortEarly: false })

// Throw if config is invalid
if (result.error) {
  throw new Error('The server config is invalid. ' + result.error.message)
}

result.value.http_proxy = process.env.http_proxy

// Return the config
module.exports = result.value
