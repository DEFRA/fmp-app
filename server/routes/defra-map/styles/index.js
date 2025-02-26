const baseMapDefault = require('./OS_VTS_27700_Open_Outdoor.json')
const baseMapDark = require('./OS_VTS_27700_Open_Dark.json')
const baseMapDefaultOriginal = require('./OS_VTS_27700_Open_Outdoor_Original.json')
const baseMapDarkHorizontalNames = require('./OS_VTS_27700_Open_Dark_Horizontal_Names.json')
const polygonDefault = require('./OS_VTS_27700_Outdoor.json')
const polygonDark = require('./OS_VTS_27700_Dark.json')
const openTile = require('./open-tile.json')
const vtsTile = require('./vts-tile.json')

module.exports = [
  {
    method: 'GET',
    path: '/map/styles/open-tile.json',
    handler: () => openTile
  }, {
    method: 'GET',
    path: '/map/styles/vts-tile.json',
    handler: () => vtsTile
  }, {
    method: 'GET',
    path: '/map/styles/base-map-default',
    handler: () => baseMapDefault
  }, {
    method: 'GET',
    path: '/map/styles/base-map-dark',
    handler: () => baseMapDark
  }, {
    method: 'GET',
    path: '/map/styles/base-map-default-original',
    handler: () => baseMapDefaultOriginal
  }, {
    method: 'GET',
    path: '/map/styles/base-map-dark-horizontal-names',
    handler: () => baseMapDarkHorizontalNames
  }, {
    method: 'GET',
    path: '/map/styles/polygon-default',
    handler: () => polygonDefault
  }, {
    method: 'GET',
    path: '/map/styles/polygon-dark',
    handler: () => polygonDark
  }
]
