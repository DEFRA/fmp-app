const nunjucks = require('nunjucks')
const util = require('../util')
const { config } = require('../../config')
const pkg = require('../../package.json')
const { gaAccId, fbAppId, analyticsAccount } = config

const findErrorMessageById = (errorSummary, id) => {
  return errorSummary?.find(error => error.href === `#${id}`)
}

module.exports = {
  plugin: require('@hapi/vision'),
  options: {
    engines: {
      html: {
        compile: (src, options) => {
          const template = nunjucks.compile(src, options.environment)

          return (context) => {
            const html = template.render(
              context /* , function (err, value) {
              console.error(err)
            } */
            )
            return html
          }
        },
        prepare: (options, next) => {
          const env = (options.compileOptions.environment = nunjucks.configure(options.path))

          env.addFilter('formatDate', util.formatDate)
          env.addFilter('toFixed', util.toFixed)

          env.addGlobal('findErrorMessageById', findErrorMessageById)

          return next()
        }
      }
    },
    path: ['server/views', 'node_modules/govuk-frontend/dist/govuk', 'node_modules/govuk-frontend/dist/govuk/components/'],
    isCached: !config.isDev,
    context: {
      env: config.env,
      appVersion: pkg.version,
      assetPath: '/assets',
      serviceName: 'Flood map for planning',
      gaAccId,
      fbAppId,
      analyticsAccount
    }
  }
}
