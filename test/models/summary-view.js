const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const SummaryViewModel = require('../../server/models/summary-view')
// Test data objects

const testObjects = require('./get-fmp-zones')

lab.experiment('summary-view view model tests', () => {
  lab.test('zone1', () => {
    const summaryViewModel = new SummaryViewModel(300000, 400000, testObjects.zone1)

    Code.expect(summaryViewModel.isZone2).to.be.false()
    Code.expect(summaryViewModel.isZone3).to.be.false()
    Code.expect(summaryViewModel.isAreaBenefiting).to.be.false()
    Code.expect(summaryViewModel.isZone1).to.be.true()
    Code.expect(summaryViewModel.easting).to.equal(300000)
    Code.expect(summaryViewModel.northing).to.equal(400000)
  })

  lab.test('zone2', () => {
    const summaryViewModel = new SummaryViewModel(300000, 400000, testObjects.zone2)

    Code.expect(summaryViewModel.isZone2).to.be.true()
    Code.expect(summaryViewModel.isZone3).to.be.false()
    Code.expect(summaryViewModel.isAreaBenefiting).to.be.false()
    Code.expect(summaryViewModel.isZone1).to.be.false()
    Code.expect(summaryViewModel.easting).to.equal(300000)
    Code.expect(summaryViewModel.northing).to.equal(400000)
  })

  lab.test('zone3', () => {
    const summaryViewModel = new SummaryViewModel(300000, 400000, testObjects.zone3)

    Code.expect(summaryViewModel.isZone2).to.be.false()
    Code.expect(summaryViewModel.isZone3).to.be.true()
    Code.expect(summaryViewModel.isAreaBenefiting).to.be.false()
    Code.expect(summaryViewModel.isZone1).to.be.false()
    Code.expect(summaryViewModel.easting).to.equal(300000)
    Code.expect(summaryViewModel.northing).to.equal(400000)
  })

  lab.test('area benefiting', () => {
    const summaryViewModel = new SummaryViewModel(300000, 400000, testObjects.areaBenefiting)

    Code.expect(summaryViewModel.isZone2).to.be.false()
    Code.expect(summaryViewModel.isZone3).to.be.false()
    Code.expect(summaryViewModel.isAreaBenefiting).to.be.true()
    Code.expect(summaryViewModel.isZone1).to.be.false()
    Code.expect(summaryViewModel.easting).to.equal(300000)
    Code.expect(summaryViewModel.northing).to.equal(400000)
  })
})
