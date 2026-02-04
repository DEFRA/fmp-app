'use strict'

module.exports = require('neostandard')({
  env: ['jest', 'node'],
  ignores: [
    '**/defra-map/',
    '**/server/public/'
  ]
})
