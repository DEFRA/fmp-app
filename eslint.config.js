'use strict'

const neostandard = require('neostandard')

module.exports = [
  ...neostandard({
    env: ['jest', 'node'],
    ignores: [
      '**/_results_/',
      '**/server/public/',
      'e2e/playwright-report/**'
    ]
  }),
  {
    files: ['client/**'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        XMLHttpRequest: 'readonly'
      }
    }
  },
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
