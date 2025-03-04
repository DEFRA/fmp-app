const { submitGetRequest } = require('../../__test-helpers__/server')
const constants = require('../../constants')
const url = constants.routes.FLOOD_ZONE_RESULTS_EXPLAINED

describe(url, () => {
  it('GET', async () => {
    await submitGetRequest({ url }, 'Flood zones and what they mean')
  })
})
