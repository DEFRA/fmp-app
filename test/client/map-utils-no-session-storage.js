const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const { mockOpenLayers } = require('./mock-open-layers')

lab.experiment('map-utils without sessionStorage', () => {
  let mapState
  let restoreStorageAvailable
  let mapUtils
  let restoreOpenLayers

  lab.before(async () => {
    restoreOpenLayers = mockOpenLayers()
    mapUtils = require('../../client/js/map-utils')
    restoreStorageAvailable = mapUtils._mockSessionStorageAvailable(false)
    mapState = mapUtils.mapState
  })

  lab.after(async () => {
    restoreOpenLayers()
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
