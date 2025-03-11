module.exports = [
  {
    method: 'GET',
    path: '/assets/govuk-frontend.min.js',
    options: {
      handler: {
        file: 'node_modules/govuk-frontend/dist/govuk/govuk-frontend.min.js'
      }
    }
  },
  {
    method: 'GET',
    path: '/assets/{path*}',
    options: {
      handler: {
        directory: {
          path: [
            'server/public/static',
            'server/public/build',
            'server/public/assets',
            'node_modules/govuk-frontend/dist/govuk/assets',
            'node_modules/accessible-autocomplete/dist',
            'node_modules/nunjucks/browser'
          ]
        }
      }
    }
  }
]
