const mock = require('mock-require')

class MockIcon {
  constructor (config) {
    this.config = config
  }

  setScale (scale) {
    Object.assign(this.config, { scale })
  }
}

class MockGeometry { // Shape could be a Point or a Polygon
  constructor (coordinates) {
    this.coordinates = coordinates
  }

  getCoordinates () {
    return this.coordinates
  }

  setCoordinates (coordinates) {
    this.coordinates = coordinates
  }
}

class MockShape { // Shape could be a Point or a Polygon
  constructor (coordinates) {
    this.geometry = new MockGeometry(coordinates)
  }

  getGeometry () {
    return this.geometry
  }
}
const MockMapExtents = (size, center, resolution) => ({
  getView: () => MockView(center, resolution),
  getSize: () => size
})

const MockView = (center, resolution) => ({
  getCenter: () => center,
  getResolution: () => resolution
})

const mockOpenLayers = () => {
  const defaultMock = function (config) { return config }
  mock('ol/layer/Tile', { default: defaultMock })
  mock('ol/source/TileWMS', { default: defaultMock })
  mock('ol/tilegrid/TileGrid', { default: defaultMock })
  mock('ol/style/Icon', { default: MockIcon })
  return () => {
    mock.stop('ol/layer/Tile')
    mock.stop('ol/source/TileWMS')
    mock.stop('ol/tilegrid/TileGrid')
    mock.stop('ol/style/Icon')
  }
}

module.exports = { mockOpenLayers, MockShape, MockView, MockMapExtents }
