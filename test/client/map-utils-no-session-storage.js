const Lab = require('@hapi/lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const mock = require('mock-require')

lab.experiment('map-utils without sessionStorage', () => {
  let mapState
  let restoreStorageAvailable
  let mapUtils

  lab.before(async () => {
    const defaultMock = function (config) { return config }
    mock('ol/layer/Tile', { default: defaultMock })
    mock('ol/source/TileWMS', { default: defaultMock })
    mock('ol/tilegrid/TileGrid', { default: defaultMock })
    mapUtils = require('../../client/js/map-utils')
    restoreStorageAvailable = mapUtils._mockSessionStorageAvailable(false)
    mapState = mapUtils.mapState
  })

  lab.after(async () => {
    mock.stop('ol/layer/Tile')
    mock.stop('ol/source/TileWMS')
    mock.stop('ol/tilegrid/TileGrid')
    mapUtils._mockSessionStorageAvailable(restoreStorageAvailable)
  })

  lab.test('mapState.getItem calls should be undifined but not error', async () => {
    const point = mapState.getItem('point')
    Code.expect(point).equals(undefined)
  })

  lab.test('mapState.setItem followed by getItem should do nothing but not error', async () => {
    mapState.setItem('point', '12345')
    const point = mapState.getItem('point')
    Code.expect(point).to.equal(undefined)
  })

  lab.test('mapState.removeItem should do nothing but not error', async () => {
    mapState.removeItem('point')
    const point = mapState.getItem('point')
    Code.expect(point).to.equal(undefined)
  })
})
