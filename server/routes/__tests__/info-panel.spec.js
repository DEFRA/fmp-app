const { submitGetRequest } = require('../../__test-helpers__/server')

const url = '/defra-map/info-panel'

describe('info-panel', () => {
  // beforeEach(async () => {
  // })

  describe('Flood Zones', () => {
    it('should show the info panel for flood zone 3', async () => {
      const response = await submitGetRequest({ url: `${url}?coords=[395047,341830]&ds=fz&fz=3&fs=River` })
      expect(response.statusCode).toEqual(200)
      const { payload } = response
      document.body.innerHTML = payload
      expect(document.getElementById('info-fz3-river').textContent).toEqual('395047,341830')
      expect(payload).toMatchSnapshot()
    })
  })
})
