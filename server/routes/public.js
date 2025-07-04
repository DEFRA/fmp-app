module.exports = [
  {
    method: 'GET',
    path: '/assets/govuk-frontend.min.js',
    options: {
      handler: {
        file: 'node_modules/govuk-frontend/dist/govuk/govuk-frontend.min.js'
      },
      tags: ['asset']
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
            'node_modules/govuk-frontend/dist/govuk/assets/rebrand',
            'node_modules/nunjucks/browser'
          ]
        }
      },
      tags: ['asset']
    }
  }
]
