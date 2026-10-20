const { submitGetRequest } = require('../../__test-helpers__/server')
const blackAndWhiteMap = require('../defra-map/styles/OS_VTS_27700_Black_and_White.json')
const masterMap = require('../defra-map/styles/OS_VTS_27700_Outdoor.json')
const masterMapDark = require('../defra-map/styles/OS_VTS_27700_Dark.json')
const vtsTile = require('../defra-map/styles/vts-tile.json')

describe('map style routes', () => {
  const urls = [
    ['/map/styles/vts-tile.json', vtsTile],
    ['/map/styles/black-and-white-map', blackAndWhiteMap],
    ['/map/styles/master-map', masterMap],
    ['/map/styles/master-map-dark', masterMapDark]
  ]

  urls.forEach(([path, mapStyleObject]) => {
    it(`should return expected result for ${path}`, async () => {
      const mapStyleObjectString = (JSON.stringify(mapStyleObject)).replaceAll('FMP_PROXY', 'http://localhost:3005')
      const expectedResponse = JSON.parse(mapStyleObjectString)
      const response = await submitGetRequest({ url: path })
      expect(response.result).toEqual(expectedResponse)
    })
  })
})
