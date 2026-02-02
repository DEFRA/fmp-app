const { submitGetRequest } = require('../../__test-helpers__/server')

const constants = require('../../constants')

const url = constants.routes.MAP_HELP

describe('map-help', () => {
  it('Should return map-help page', async () => {
    const response = await submitGetRequest({ url }, 'Help using the flood map')
    expect(response.result).toMatchSnapshot()
  })
})
