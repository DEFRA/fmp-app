const schema = require('./schema')
const config = require('./server.json')

// Validate config
const result = schema.validate(config, { abortEarly: false })

// Throw if config is invalid
if (result.error) {
  throw new Error('The server config is invalid. ' + result.error.message)
}

// Return the config
module.exports = result.value
