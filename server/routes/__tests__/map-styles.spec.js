const { submitGetRequest } = require('../../__test-helpers__/server')
const baseMapDefault = require('../defra-map/styles/OS_VTS_27700_Open_Outdoor.json')
const baseMapDark = require('../defra-map/styles/OS_VTS_27700_Open_Dark.json')
const baseMapBlackAndWhite = require('../defra-map/styles/OS_VTS_27700_Black_and_White.json')
const baseMapBlackAndWhiteOpen = require('../defra-map/styles/OS_VTS_27700_Open_Black_and_White.json')
const polygonDefault = require('../defra-map/styles/OS_VTS_27700_Outdoor.json')
const polygonDark = require('../defra-map/styles/OS_VTS_27700_Dark.json')
const openTile = require('../defra-map/styles/open-tile.json')
const vtsTile = require('../defra-map/styles/vts-tile.json')

describe('map style routes', () => {
  const urls = [
    ['/map/styles/open-tile.json', openTile],
    ['/map/styles/vts-tile.json', vtsTile],
    ['/map/styles/base-map-default', baseMapDefault],
    ['/map/styles/base-map-dark', baseMapDark],
    ['/map/styles/base-map-black-and-white', baseMapBlackAndWhite],
    ['/map/styles/base-map-black-and-white-open', baseMapBlackAndWhiteOpen],
    ['/map/styles/polygon-default', polygonDefault],
    ['/map/styles/polygon-dark', polygonDark]
  ]

  urls.forEach(([path, expectedResponse]) => {
    it(`should return expected result for ${path}`, async () => {
      const response = await submitGetRequest({ url: path })
      expect(response.result).toEqual(expectedResponse)
    })
  })
})
