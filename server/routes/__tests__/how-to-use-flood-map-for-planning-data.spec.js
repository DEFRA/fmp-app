const { submitGetRequest } = require('../../__test-helpers__/server')
const constants = require('../../constants')

const url = constants.routes.HOW_TO_USE_FLOOD_MAP_FOR_PLANNING_DATA

describe('how-to-use-flood-map-for-planning-data', () => {
  it('Should return how-to-use-flood-map-for-planning-data page', async () => {
    const response = await submitGetRequest({ url })
    expect(response.result).toMatchSnapshot()
  })
})
