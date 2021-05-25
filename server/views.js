const handlebars = require('handlebars')
const moment = require('moment-timezone')
const config = require('../config')
const pkg = require('../package.json')
const analyticsAccount = config.analyticsAccount
const appVersion = pkg.version
const appName = pkg.name

const defaultContext = {
  globalHeaderText: 'GOV.UK',
  pageTitle: 'Flood map for planning - GOV.UK',
  ogDescription: 'Learn about a site location\'s flood probability as part of development planning',
  skipLinkMessage: 'Skip to main content',
  homepageUrl: 'https://www.gov.uk/',
  logoLinkTitle: 'Go to the GOV.UK homepage',
  crownCopyrightMessage: '© Crown copyright',
  // assetPath: '/public/',
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
    html: handlebars
  },
  relativeTo: __dirname,
  layout: true,
  isCached: config.views.isCached,
  path: 'views',
  partialsPath: 'views/partials',
  helpersPath: 'views/helpers',
  context: defaultContext
}
