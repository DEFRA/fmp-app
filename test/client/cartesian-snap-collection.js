const Lab = require('@hapi/lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const { mockOpenLayers } = require('./mock-open-layers')

lab.experiment('CartesianSnapCollection', () => {
  let cartesianSnapCollection
  let addSpy
  let restoreOpenLayers
  let CartesianSnapCollection

  lab.before(async () => {
    restoreOpenLayers = mockOpenLayers()
    const snapCollection = require('../../client/js/cartesian-snap-collection')
    CartesianSnapCollection = snapCollection.CartesianSnapCollection
  })

  lab.after(async () => {
    restoreOpenLayers()
  })

  lab.beforeEach(async () => {
    cartesianSnapCollection = new CartesianSnapCollection()
    addSpy = sinon.spy(cartesianSnapCollection, 'add')
  })

  lab.test('a new instance of CartesianSnapCollection should have no snapFeatures', async () => {
    Code.expect(JSON.stringify(cartesianSnapCollection.snapFeatures)).to.equal('[]')
  })

  // arrayToGeometryFeature: helper to make tests easier to read/write (ie we dont need to specify geometry: {} everywhere)
  const arrayToGeometryFeature = array => JSON.stringify(array.map((value) => ({ geometry: value })))

  lab.test('After calling setExtents a cartesianSnapCollection should have points', async () => {
    cartesianSnapCollection.setExtents([10, 10], [12, 12])
    Code.expect(JSON.stringify(cartesianSnapCollection.snapFeatures)).to.equal(arrayToGeometryFeature([
      [10, 10], [10, 11], [10, 12],
      [11, 10], [11, 11], [11, 12],
      [12, 10], [12, 11], [12, 12]
    ]))
    Code.expect(addSpy.callCount).to.equal(9)
  })

  lab.test('After calling setExtents for a contained range, cartesianSnapCollection.add should not be called ', async () => {
    cartesianSnapCollection.setExtents([10, 10], [12, 12])
    cartesianSnapCollection.setExtents([11, 11], [12, 12]) // Should not call add as all these points are already added
    Code.expect(cartesianSnapCollection.snapFeatures.length).to.equal(9)
    Code.expect(addSpy.callCount).to.equal(9)
  })

  lab.test('After calling setExtents for a non contained range, cartesianSnapCollection should contain the new Range ', async () => {
    cartesianSnapCollection.setExtents([10, 10], [12, 12])
    cartesianSnapCollection.setExtents([20, 20], [22, 22]) // Should call add as these points are not already added
    Code.expect(cartesianSnapCollection.snapFeatures.length).to.equal(18)
    Code.expect(addSpy.callCount).to.equal(18)
    Code.expect(JSON.stringify(cartesianSnapCollection.snapFeatures)).to.equal(arrayToGeometryFeature([
      [10, 10], [10, 11], [10, 12],
      [11, 10], [11, 11], [11, 12],
      [12, 10], [12, 11], [12, 12],
      [20, 20], [20, 21], [20, 22],
      [21, 20], [21, 21], [21, 22],
      [22, 20], [22, 21], [22, 22]
    ]))
  })

  lab.test('After calling setExtents for a partially contained range, cartesianSnapCollection should contain the points not already included ', async () => {
    cartesianSnapCollection.setExtents([10, 10], [12, 12])
    cartesianSnapCollection.setExtents([11, 11], [13, 13]) // Should not call add as all these points are already added
    Code.expect(cartesianSnapCollection.snapFeatures.length).to.equal(14)
    Code.expect(addSpy.callCount).to.equal(14)
    Code.expect(JSON.stringify(cartesianSnapCollection.snapFeatures)).to.equal(arrayToGeometryFeature([
      [10, 10], [10, 11], [10, 12],
      [11, 10], [11, 11], [11, 12],
      [12, 10], [12, 11], [12, 12],
      [11, 13],
      [12, 13],
      [13, 11], [13, 12], [13, 13]
    ]))
  })

  lab.test('After calling setExtents for a range, within the extents of existing ranges, the new range should be added ', async () => {
    cartesianSnapCollection.setExtents([10, 10], [12, 12])
    cartesianSnapCollection.setExtents([20, 20], [22, 22]) // Should call add as all these points are not already added
    cartesianSnapCollection.setExtents([13, 13], [14, 14]) // Should call add as all these points are not already added
    Code.expect(JSON.stringify(cartesianSnapCollection.snapFeatures)).to.equal(arrayToGeometryFeature([
      [10, 10], [10, 11], [10, 12],
      [11, 10], [11, 11], [11, 12],
      [12, 10], [12, 11], [12, 12],
      [20, 20], [20, 21], [20, 22],
      [21, 20], [21, 21], [21, 22],
      [22, 20], [22, 21], [22, 22],
      [13, 13], [13, 14],
      [14, 13], [14, 14]
    ]))
  })

  lab.test('cartesianSnapCollection.hasRange to cover all test cases ', async () => {
    cartesianSnapCollection.setExtents([9, 9], [10, 10])
    Code.expect(cartesianSnapCollection.hasRange([9, 8], [9, 9])).to.equal(false)
  })

  lab.test('cartesianSnapCollection test adding a new range that is entirely within a combination of ranges, but no single one', async () => {
    cartesianSnapCollection.setExtents([3, 3], [4, 4])
    Code.expect(JSON.stringify(cartesianSnapCollection.snapFeatures)).to.equal(arrayToGeometryFeature([
      [3, 3], [3, 4], [4, 3], [4, 4]
    ]))
    cartesianSnapCollection.setExtents([5, 3], [6, 4])
    Code.expect(JSON.stringify(cartesianSnapCollection.snapFeatures)).to.equal(arrayToGeometryFeature([
      [3, 3], [3, 4], [4, 3], [4, 4],
      [5, 3], [5, 4], [6, 3], [6, 4]
    ]))
    cartesianSnapCollection.setExtents([4, 3], [5, 4]) // already exists but is a new range
    Code.expect(JSON.stringify(cartesianSnapCollection.snapFeatures)).to.equal(arrayToGeometryFeature([
      [3, 3], [3, 4], [4, 3], [4, 4],
      [5, 3], [5, 4], [6, 3], [6, 4]
    ]))
  })

  lab.test('add individual regions to cartesianSnapCollection to cover all test cases ', async () => {
    cartesianSnapCollection.setExtents([0, 0], [0, 0])
    cartesianSnapCollection.setExtents([10, 10], [10, 10])
    cartesianSnapCollection.setExtents([0, 0], [0, 0])
    Code.expect(JSON.stringify(cartesianSnapCollection.snapFeatures)).to.equal(arrayToGeometryFeature([[0, 0], [10, 10]]))
  })
})
