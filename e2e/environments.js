/**
 * Named environment URLs for e2e tests.
 *
 * Usage:
 *   TEST_ENV=tst npm run test:public     — run against test environment
 *   TEST_ENV=local npm run test:ci       — run against local dev server
 *
 * You can still override with BASE_URL / INTERNAL_BASE_URL env vars directly.
 */
const environments = {
  local: {
    baseUrl: 'http://localhost:8050',
    internalBaseUrl: 'http://localhost:8050'
  },
  dev: {
    baseUrl: 'https://fmp2-dev.aws-int.defra.cloud/',
    internalBaseUrl: 'https://fmp2-internal-dev.aws-int.defra.cloud/'
  },
  tst: {
    baseUrl: 'https://fmp2-tst.aws-int.defra.cloud/',
    internalBaseUrl: 'https://fmp2-internal-tst.aws-int.defra.cloud/'
  }
}

export default environments
