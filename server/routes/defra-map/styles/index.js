const baseMapDefault = require('./OS_VTS_27700_Open_Outdoor.json')
const baseMapDark = require('./OS_VTS_27700_Open_Dark.json')
const baseMapBlackAndWhite = require('./OS_VTS_27700_Black_and_White.json')
const baseMapBlackAndWhiteOpen = require('./OS_VTS_27700_Open_Black_and_White.json')
const polygonDefault = require('./OS_VTS_27700_Outdoor.json')
const polygonDark = require('./OS_VTS_27700_Dark.json')
const openTile = require('./open-tile.json')
const vtsTile = require('./vts-tile.json')

const method = 'GET'
const options = { tags: ['asset'] }
const generateRoute = (path, handler) => ({ method, path, handler, options })

module.exports = [
  generateRoute('/map/styles/open-tile.json', () => openTile),
  generateRoute('/map/styles/vts-tile.json', () => vtsTile),
  generateRoute('/map/styles/base-map-default', () => baseMapDefault),
  generateRoute('/map/styles/base-map-dark', () => baseMapDark),
  generateRoute('/map/styles/base-map-black-and-white', () => baseMapBlackAndWhite),
  generateRoute('/map/styles/base-map-black-and-white-open', () => baseMapBlackAndWhiteOpen),
  generateRoute('/map/styles/polygon-default', () => polygonDefault),
  generateRoute('/map/styles/polygon-dark', () => polygonDark)
]
