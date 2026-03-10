'use strict'

const neostandard = require('neostandard')

module.exports = [
  ...neostandard({
    env: ['jest', 'node'],
    ignores: [
      '**/_results_/',
      '**/defra-map/',
      '**/server/public/'
    ]
  }),
  {
    files: ['e2e/**'],
    languageOptions: {
      globals: {
        browser: 'readonly',
        $: 'readonly',
        $$: 'readonly',
        baseUrl: 'readonly'
      }
    }
  }
]
