const mock = require('mock-require')

const mockOpenLayers = () => {
  const defaultMock = function (config) { return config }
  mock('ol/layer/Tile', { default: defaultMock })
  mock('ol/source/TileWMS', { default: defaultMock })
  mock('ol/tilegrid/TileGrid', { default: defaultMock })
  mock('ol/style/Icon', { default: defaultMock })
  return () => {
    mock.stop('ol/layer/Tile')
    mock.stop('ol/source/TileWMS')
    mock.stop('ol/tilegrid/TileGrid')
    mock.stop('ol/style/Icon')
  }
}

module.exports = { mockOpenLayers }
