const { submitGetRequest } = require('../../__test-helpers__/server')
const { assertCopy } = require('../../__test-helpers__/copy')
const url = '/about'
const axios = require('axios')
jest.mock('axios')

const mockHealthcheckResponse = {
  data: {
    version: 'v8.8.8',
    revision: '998877665544332211',
    environment: 'test'
  }
}

describe('About Page', () => {
  beforeEach(async () => {
    axios.get.mockResolvedValue(mockHealthcheckResponse)
  })

  it('/about page should contain version numbers as expected', async () => {
    await submitGetRequest({ url }, 'Flood map for planning')
    assertCopy('#fmp-app-version', 'Version: v3.0.0-1')
    assertCopy('#fmp-app-revision', 'Revision: 9256171')
    assertCopy('#fmp-app-type', 'internal')
    assertCopy('#fmp-api-version', 'Version: v8.8.8')
    assertCopy('#fmp-api-revision', 'Revision: 9988776')
    assertCopy('#environment', 'Test')
  })

  it('/about page should contain version numbers as expected when a tag build', async () => {
    jest.mock('../../../version', () => ({ version: '3.0.0', revision: '925617123' }))
    await submitGetRequest({ url }, 'Flood map for planning')
    assertCopy('#fmp-app-version', 'Version: 3.0.0')
    assertCopy('#fmp-app-revision', 'Revision: 9256171')
    assertCopy('#fmp-app-type', 'internal')
    assertCopy('#fmp-api-version', 'Version: v8.8.8')
    assertCopy('#fmp-api-revision', 'Revision: 9988776')
    assertCopy('#environment', 'Test')
  })

  it('/about page should contain version numbers as expected when api is not available', async () => {
    axios.get.mockRejectedValue('AN ERROR')
    await submitGetRequest({ url }, 'Flood map for planning')
    assertCopy('#fmp-app-version', 'Version: 3.0.0')
    assertCopy('#fmp-app-revision', 'Revision: 9256171')
    assertCopy('#fmp-app-type', 'internal')
    assertCopy('#fmp-api-version', 'Version: not available')
    assertCopy('#fmp-api-revision', 'Revision: not available')
    assertCopy('#environment', 'not available')
  })

  it('/about page should contain version numbers as expected when api returns nothing', async () => {
    axios.get.mockResolvedValue({})
    await submitGetRequest({ url }, 'Flood map for planning')
    assertCopy('#fmp-app-version', 'Version: 3.0.0')
    assertCopy('#fmp-app-revision', 'Revision: 9256171')
    assertCopy('#fmp-app-type', 'internal')
    assertCopy('#fmp-api-version', 'Version:')
    assertCopy('#fmp-api-revision', 'Revision:')
    assertCopy('#environment', ' ')
  })
})
