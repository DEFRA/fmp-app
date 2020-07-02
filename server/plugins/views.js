const nunjucks = require('nunjucks')
const util = require('../util')
const config = require('../config')
const pkg = require('../../package.json')
const {
  gaAccId,
  fbAppId
} = config

module.exports = {
  plugin: require('@hapi/vision'),
  options: {
    engines: {
      html: {
        compile: (src, options) => {
          const template = nunjucks.compile(src, options.environment)

          return (context) => {
            const html = template.render(context /* , function (err, value) {
              console.error(err)
            } */)
            return html
          }
        },
        prepare: (options, next) => {
          const env = options.compileOptions.environment = nunjucks.configure(options.path)

          env.addFilter('formatDate', util.formatDate)
          env.addFilter('toFixed', util.toFixed)

          return next()
        }
      }
    },
    path: [
      'server/views',
      'node_modules/govuk-frontend/govuk',
      'node_modules/govuk-frontend/govuk/components/'
    ],
    isCached: !config.isDev,
    context: {
      env: config.env,
      appVersion: pkg.version,
      assetPath: '/assets',
      serviceName: 'Flood Map for Planning',
      gaAccId,
      fbAppId
    }
  }
}
