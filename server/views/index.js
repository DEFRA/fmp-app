const config = require('../../config')
const analyticsAccount = config.analyticsAccount
const pkg = require('../../package.json')
const appVersion = pkg.version
const appName = pkg.name
const moment = require('moment')

const defaultContext = {
  globalHeaderText: 'GOV.UK',
  pageTitle: 'Flood map for planning - GOV.UK',
  ogDescription: 'Learn about a site location\'s flood probability as part of development planning',
  skipLinkMessage: 'Skip to main content',
  homepageUrl: 'https://www.gov.uk/',
  logoLinkTitle: 'Go to the GOV.UK homepage',
  crownCopyrightMessage: '© Crown copyright',
  assetPath: '/public/',
  htmlLang: 'en',
  headerClass: 'with-proposition',
  analyticsAccount: analyticsAccount,
  appName: appName,
  appVersion: appVersion,
  phase: 'beta',
  year: moment(Date.now()).format('YYYY'),
  siteUrl: config.siteUrl,
  fbAppId: config.fbAppId,
  googleVerification: config.googleVerification
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
