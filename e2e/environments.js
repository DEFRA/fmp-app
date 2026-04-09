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
}
