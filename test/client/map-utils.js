const Lab = require('@hapi/lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const mapConfig = require('../../client/js/map-config.json')
const mock = require('mock-require')

const sessionStorage = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => (store[key] = value.toString()),
    removeItem: (key) => (delete store[key]),
    clear: () => (store = {})
  }
})()

lab.experiment('map-utils', () => {
  let createTileLayer
  let mapState
  let restoreStorageAvailable
  let mapUtils

  lab.before(async () => {
    const defaultMock = function (config) { return config }
    mock('ol/layer/Tile', { default: defaultMock })
    mock('ol/source/TileWMS', { default: defaultMock })
    mock('ol/tilegrid/TileGrid', { default: defaultMock })
    global.window = { sessionStorage }
    mapUtils = require('../../client/js/map-utils')
    restoreStorageAvailable = mapUtils._mockSessionStorageAvailable(true)
    createTileLayer = mapUtils.createTileLayer
    mapState = mapUtils.mapState
  })

  lab.afterEach(async () => {
    global.window.sessionStorage.clear()
  })

  lab.after(async () => {
    mock.stop('ol/layer/Tile')
    mock.stop('ol/source/TileWMS')
    mock.stop('ol/tilegrid/TileGrid')
    mapUtils._mockSessionStorageAvailable(restoreStorageAvailable)
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

  lab.test('mapState.getItem calls should be initially null', async () => {
    Code.expect(mapState.getItem('point')).to.be.null()
  })

  lab.test('mapState.setItem followed by getItem should return the set item', async () => {
    Code.expect(mapState.getItem('point')).to.be.null()
    mapState.setItem('point', '12345')
    Code.expect(mapState.getItem('point')).to.equal('12345')
  })

  lab.test('mapState.removeItem should remove the item from storage', async () => {
    Code.expect(mapState.getItem('point')).to.be.null()
    mapState.setItem('point', '12345')
    Code.expect(mapState.getItem('point')).to.equal('12345')
    mapState.removeItem('point')
    Code.expect(mapState.getItem('point')).to.be.null()
  })

  lab.test('getTargetUrl with a point', async () => {
    const point = {
      getGeometry: () => ({ getCoordinates: () => ([479922, 484181]) })
    }
    const url = mapUtils.getTargetUrl('point', undefined, point, 'pickering', 'Joe Bloggs', 'joe@example.com')
    Code.expect(url).equals('/flood-zone-results?easting=479922&northing=484181&location=pickering&fullName=Joe Bloggs&recipientemail=joe@example.com')
  })

  lab.test('getTargetUrl with a polygon', async () => {
    const polygon = {
      getGeometry: () => ({
        getExtent: () => ([479816, 484194, 480082, 484404]),
        getCoordinates: () => (
          [[[479926, 484194],
            [480082, 484297],
            [480015, 484387],
            [479829, 484404],
            [479816, 484204],
            [479926, 484194]]])
      })
    }

    const url = mapUtils.getTargetUrl('polygon', polygon, undefined, 'pickering', 'Joe Bloggs', 'joe@example.com')
    Code.expect(url).equals('/flood-zone-results?polygon=[[479926,484194],[480082,484297],[480015,484387],[479829,484404],[479816,484204],[479926,484194]]&center=[479949,484299]&location=pickering&fullName=Joe Bloggs&recipientemail=joe@example.com')
  })

  lab.test('getTargetUrl when featureMode is polygon but a polygon isn\'t yet defined', async () => {
    const point = {
      getGeometry: () => ({ getCoordinates: () => ([479922, 484181]) })
    }
    const url = mapUtils.getTargetUrl('polygon', undefined, point, 'pickering', 'Joe Bloggs', 'joe@example.com')
    Code.expect(url).equals('/flood-zone-results?easting=479922&northing=484181&location=pickering&fullName=Joe Bloggs&recipientemail=joe@example.com')
  })
})
