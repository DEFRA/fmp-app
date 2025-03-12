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
    path: '/public/defra-map/{path*}',
    options: {
      handler: {
        directory: {
          path: 'dist/'
        }
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
            'dist/',
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
  },
  {
    method: 'GET',
    path: '/assets/stylesheets/base/{path*}',
    options: {
      handler: {
        directory: {
          path: [
            'node_modules/@arcgis/core/assets/esri/themes/base'
          ]
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/assets/stylesheets/map/@mapbox/{path*}',
    options: {
      handler: {
        directory: {
          path: [
            'node_modules/@mapbox'
          ]
        }
      }
    }
  }
]
