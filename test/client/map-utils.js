const Lab = require('@hapi/lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const mapConfig = require('../../client/js/map-config.json')
const mock = require('mock-require')

lab.experiment('map-utils', () => {
  let createTileLayer
  lab.before(async () => {
    const defaultMock = function (config) { return config }
    mock('ol/layer/Tile', { default: defaultMock })
    mock('ol/source/TileWMS', { default: defaultMock })
    mock('ol/tilegrid/TileGrid', { default: defaultMock })
    createTileLayer = require('../../client/js/map-utils').createTileLayer
  })

  lab.after(async () => {
    mock.stop('ol/layer/Tile')
    mock.stop('ol/source/TileWMS')
    mock.stop('ol/tilegrid/TileGrid')
  })

  lab.test('createTileLayer', async () => {
    const tileLayer = createTileLayer(mapConfig)
    Code.expect(tileLayer).to.equal({
      ref: 'fmp',
      opacity: 0.7,
      zIndex: 0,
      source: {
        url: '/gwc-proxy',
        serverType: 'geoserver',
        params: { LAYERS: 'fmp:fmp', TILED: true, VERSION: '1.1.1' },
        tileGrid: {
          extent: [0, 0, 1000000, 1120000],
          resolutions: [896, 448, 224, 112, 56, 28, 14, 7, 3.5, 1.75, 0.875],
          tileSize: [250, 250]
        }
      }
    })
  })
})
