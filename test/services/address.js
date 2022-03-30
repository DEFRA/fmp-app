const Lab = require('lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const { findByPlace } = require('../../server/services/address')
const util = require('../../server/util')

lab.experiment('address', () => {
  let restoreGetJson

  lab.before(async () => {
    restoreGetJson = util.getJson
  })

  lab.after(async () => {
    util.getJson = restoreGetJson
  })

  lab.test('findByPlace should return an empty array if payload does not exist', async () => {
    util.getJson = () => undefined
    const places = await findByPlace('/pickering')
    Code.expect(places).to.equal([])
  })

  lab.test('findByPlace should return an empty array if payload.results does not exist', async () => {
    util.getJson = () => ({})
    const places = await findByPlace('/pickering')
    Code.expect(places).to.equal([])
  })

  lab.test('findByPlace should return an empty array if payload.results is an empty array', async () => {
    util.getJson = () => ({ results: [] })
    const places = await findByPlace('/pickering')
    Code.expect(places).to.equal([])
  })

  lab.test('findByPlace should return an array of geometry items if payload.results is valid', async () => {
    util.getJson = () => ({
      results: [{
        GAZETTEER_ENTRY: {
          GEOMETRY_X: 123, GEOMETRY_Y: 456
        }
      }]
    })
    const places = await findByPlace('/pickering')
    Code.expect(places).to.equal([{ geometry_x: 123, geometry_y: 456 }])
  })
})
