const appPort = process.env.APP_PORT || '8050'

export const environments = {
  local: {
    baseUrl: `http://localhost:${appPort}`,
    internalBaseUrl: `http://localhost:${appPort}`,
  },
  dev: {
    baseUrl: 'https://fmp2-dev.aws-int.defra.cloud/',
    internalBaseUrl: 'https://fmp2-internal-dev.aws-int.defra.cloud/',
  },
  tst: {
    baseUrl: 'https://fmp2-tst.aws-int.defra.cloud/',
    internalBaseUrl: 'https://fmp2-internal-tst.aws-int.defra.cloud/',
  },
  pre: {
    baseUrl: 'https://fmp2-pre.aws.defra.cloud/',
    internalBaseUrl: 'https://fmp2-internal-pre.aws-int.defra.cloud/',
  },
  'prd-green': {
    baseUrl: 'https://fmp2-prd-green.aws.defra.cloud/',
    internalBaseUrl: 'https://fmp2-internal-prd-green.aws-int.defra.cloud/',
  },
  'prd-blue': {
    baseUrl: 'https://fmp2-prd-blue.aws.defra.cloud/',
    internalBaseUrl: 'https://fmp2-internal-prd-blue.aws-int.defra.cloud/',
  },
  prod: {
    baseUrl: 'https://flood-map-for-planning.service.gov.uk/',
    internalBaseUrl: 'https://fmp-internal.prd.defra.cloud/',
  },
}
