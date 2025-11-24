const { submitGetRequest } = require('../../__test-helpers__/server')
const blackAndWhiteMap = require('../defra-map/styles/OS_VTS_27700_Black_and_White.json')
const masterMap = require('../defra-map/styles/OS_VTS_27700_Outdoor.json')
const masterMapDark = require('../defra-map/styles/OS_VTS_27700_Dark.json')
const openTile = require('../defra-map/styles/open-tile.json')
const vtsTile = require('../defra-map/styles/vts-tile.json')

describe('map style routes', () => {
  const urls = [
    ['/map/styles/open-tile.json', openTile],
    ['/map/styles/vts-tile.json', vtsTile],

    ['/map/styles/black-and-white-map', blackAndWhiteMap],
    ['/map/styles/master-map', masterMap],
    ['/map/styles/master-map-dark', masterMapDark]
  ]

  urls.forEach(([path, expectedResponse]) => {
    it(`should return expected result for ${path}`, async () => {
      const response = await submitGetRequest({ url: path })
      expect(response.result).toEqual(expectedResponse)
    })
  })
})
