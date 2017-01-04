const config = require('../../config')
const pageRefreshTime = config.pageRefreshTime
const analyticsAccount = config.analyticsAccount
const pkg = require('../../package.json')
const appVersion = pkg.version
const appName = pkg.name
const moment = require('moment')

const defaultContext = {
  globalHeaderText: 'GOV.UK',
  pageTitle: 'Flood map for planning',
  skipLinkMessage: 'Skip to main content',
  homepageUrl: 'https://www.gov.uk/',
  logoLinkTitle: 'Go to the GOV.UK homepage',
  crownCopyrightMessage: '© Crown copyright',
  assetPath: '/public/',
  htmlLang: 'en',
  headerClass: 'with-proposition',
  pageRefreshTime: pageRefreshTime,
  analyticsAccount: analyticsAccount,
  appName: appName,
  appVersion: appVersion,
  phase: 'beta',
  year: moment(Date.now()).format('YYYY')
}

module.exports = {
  engines: {
    html: require('handlebars')
  },
  relativeTo: __dirname,
  layout: true,
  isCached: config.views.isCached,
  partialsPath: 'partials',
  helpersPath: 'helpers',
  context: defaultContext
}
