module.exports = [{
  method: 'GET',
  path: '/assets/all.js',
  options: {
    handler: {
      file: 'node_modules/govuk-frontend/govuk/all.js'
    },
    auth: false
  }
}, {
  method: 'GET',
  path: '/assets/{path*}',
  options: {
    handler: {
      directory: {
        path: [
          'server/public/assest/images',
          'server/public/static',
          'server/public/build',
          'server/public/assets',
          'node_modules/govuk-frontend/govuk/assets',
          'node_modules/accessible-autocomplete/dist',
          'node_modules/nunjucks/browser'
        ]
      }
    },
    auth: false
  }
}]
