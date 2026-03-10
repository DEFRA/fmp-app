'use strict'

module.exports = require('neostandard')({
  env: ['jest', 'node'],
  ignores: [
    '**/_results_/',
    '**/defra-map/',
    '**/server/public/'
  ],
  overrides: [
    {
      files: 'e2e/**',
      env: {
        browser: true
      },
      globals: {
        browser: 'readonly',
        $: 'readonly',
        $$: 'readonly',
        baseUrl: 'readonly'
      }
    }
  ]
})
