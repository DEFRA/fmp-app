const env = process.env.ENV
if (!env) {
  throw new Error("ENV environment variable is not set: allowedOrigins must be imported after require('./environment')")
}

const _allowedHostsByEnv = {
  development: [
    'fmp2-internal-dev.aws-int.defra.cloud', // Internal development environment
    'fmp2-dev.aws-int.defra.cloud', // Public development environment
  ],
  test: [
    'fmp2-internal-tst.aws-int.defra.cloud', // Internal test environment
    'fmp2-tst.aws-int.defra.cloud', // Public test environment

  ],
  'pre-prod': [
    'fmp2-internal-pre.aws-int.defra.cloud', // Internal pre-production environment
    'fmp2-pre.aws-int.defra.cloud', // Public pre-production environment
  ],
  prod: [
    'flood-map-for-planning.service.gov.uk', // Production live environment
    'fmp2-prd-blue.aws.defra.cloud', // Production blue environment
    'fmp2-prd-green.aws.defra.cloud', // Production green environment
    'fmp-internal.prd.defra.cloud', // Internal production environment
    'fmp2-internal-prd-blue.aws-int.defra.cloud', // Internal production blue environment
    'fmp2-internal-prd-green.aws-int.defra.cloud', // Internal production green environment
  ]
}

const _allowedHostsForCurrentEnv = _allowedHostsByEnv[env] || []

// Build a list of allowed origins for the current environment
const allowedOrigins = [
  ..._allowedHostsForCurrentEnv,
].reduce((_validHosts, hostname) => ({ ..._validHosts, [hostname]: hostname }), {})

// Append a locally configured value
if (process.env.localhostOrigin) {
  // localhostOrigin MUST match localhost:nnnn
  if (!/^localhost:\d+$/.test(process.env.localhostOrigin)) {
    console.log('\nlocalhostOrigin value:', `"${process.env.localhostOrigin}"\n`)
    throw new Error("Invalid localhostOrigin format. Expected 'localhost:<port>'")
  }
  allowedOrigins[process.env.localhostOrigin] = process.env.localhostOrigin
}

module.exports = { allowedOrigins }
