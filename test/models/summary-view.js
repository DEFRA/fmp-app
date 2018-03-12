const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const SummaryViewModel = require('../../server/models/summary-view')
// Test data objects

const testObjects = require('./get-fmp-zones')

lab.experiment('summary-view view model tests', () => {
  lab.test('zone1', () => {
    const summaryViewModel = new SummaryViewModel(testObjects.zone1, [300000, 400000])

    Code.expect(summaryViewModel.floodZone.isZone2).to.be.false()
    Code.expect(summaryViewModel.floodZone.isZone3).to.be.false()
    Code.expect(summaryViewModel.floodZone.isAreaBenefiting).to.be.false()
    Code.expect(summaryViewModel.floodZone.isZone1).to.be.true()
    Code.expect(summaryViewModel.easting).to.equal(300000)
    Code.expect(summaryViewModel.northing).to.equal(400000)
  })

  lab.test('zone2', () => {
    const summaryViewModel = new SummaryViewModel(testObjects.zone2, [300000, 400000])

    Code.expect(summaryViewModel.floodZone.isZone2).to.be.true()
    Code.expect(summaryViewModel.floodZone.isZone3).to.be.false()
    Code.expect(summaryViewModel.floodZone.isAreaBenefiting).to.be.false()
    Code.expect(summaryViewModel.floodZone.isZone1).to.be.false()
    Code.expect(summaryViewModel.easting).to.equal(300000)
    Code.expect(summaryViewModel.northing).to.equal(400000)
  })

  lab.test('zone3', () => {
    const summaryViewModel = new SummaryViewModel(testObjects.zone3, [300000, 400000])

    Code.expect(summaryViewModel.floodZone.isZone2).to.be.false()
    Code.expect(summaryViewModel.floodZone.isZone3).to.be.true()
    Code.expect(summaryViewModel.floodZone.isAreaBenefiting).to.be.false()
    Code.expect(summaryViewModel.floodZone.isZone1).to.be.false()
    Code.expect(summaryViewModel.easting).to.equal(300000)
    Code.expect(summaryViewModel.northing).to.equal(400000)
  })

  lab.test('area benefiting', () => {
    const summaryViewModel = new SummaryViewModel(testObjects.areaBenefiting, [300000, 400000])

    Code.expect(summaryViewModel.floodZone.isZone2).to.be.false()
    Code.expect(summaryViewModel.floodZone.isZone3).to.be.false()
    Code.expect(summaryViewModel.floodZone.isAreaBenefiting).to.be.true()
    Code.expect(summaryViewModel.floodZone.isZone1).to.be.false()
    Code.expect(summaryViewModel.easting).to.equal(300000)
    Code.expect(summaryViewModel.northing).to.equal(400000)
  })

  // // TODO do some tests with a polygon
  lab.test('polygon zone1', () => {
    const summaryViewModel = new SummaryViewModel(testObjects.zone1Polygon, [361930, 387463], [[361767, 387591], [361795, 387325], [362086, 387310], [362094, 387616], [361767, 387591]])

    Code.expect(summaryViewModel.floodZone.isZone2).to.be.false()
    Code.expect(summaryViewModel.floodZone.isZone3).to.be.false()
    Code.expect(summaryViewModel.floodZone.isAreaBenefiting).to.be.false()
    Code.expect(summaryViewModel.floodZone.isZone1).to.be.true()
    Code.expect(summaryViewModel.easting).to.equal(361930)
    Code.expect(summaryViewModel.northing).to.equal(387463)
  })

  lab.test('polygon zone2', () => {
    const summaryViewModel = new SummaryViewModel(testObjects.zone2Polygon, [361930, 387463], [[361767, 387591], [361795, 387325], [362086, 387310], [362094, 387616], [361767, 387591]])

    Code.expect(summaryViewModel.floodZone.isZone2).to.be.true()
    Code.expect(summaryViewModel.floodZone.isZone3).to.be.false()
    Code.expect(summaryViewModel.floodZone.isAreaBenefiting).to.be.false()
    Code.expect(summaryViewModel.floodZone.isZone1).to.be.false()
    Code.expect(summaryViewModel.easting).to.equal(361930)
    Code.expect(summaryViewModel.northing).to.equal(387463)
  })

  lab.test('polygon zone3', () => {
    const summaryViewModel = new SummaryViewModel(testObjects.zone3Polygon, [361930, 387463], [[361767, 387591], [361795, 387325], [362086, 387310], [362094, 387616], [361767, 387591]])

    Code.expect(summaryViewModel.floodZone.isZone2).to.be.false()
    Code.expect(summaryViewModel.floodZone.isZone3).to.be.true()
    Code.expect(summaryViewModel.floodZone.isAreaBenefiting).to.be.false()
    Code.expect(summaryViewModel.floodZone.isZone1).to.be.false()
    Code.expect(summaryViewModel.easting).to.equal(361930)
    Code.expect(summaryViewModel.northing).to.equal(387463)
  })

  lab.test('polygon AB', () => {
    const summaryViewModel = new SummaryViewModel(testObjects.areaBenefitingPolygon, [361930, 387463], [[361767, 387591], [361795, 387325], [362086, 387310], [362094, 387616], [361767, 387591]])

    Code.expect(summaryViewModel.floodZone.isZone2).to.be.false()
    Code.expect(summaryViewModel.floodZone.isZone3).to.be.false()
    Code.expect(summaryViewModel.floodZone.isAreaBenefiting).to.be.true()
    Code.expect(summaryViewModel.floodZone.isZone1).to.be.false()
    Code.expect(summaryViewModel.easting).to.equal(361930)
    Code.expect(summaryViewModel.northing).to.equal(387463)
  })

  lab.test('polygon zone3 but some AB', () => {
    const summaryViewModel = new SummaryViewModel(testObjects.zone3PolygonWithAB, [361930, 387463], [[361767, 387591], [361795, 387325], [362086, 387310], [362094, 387616], [361767, 387591]])

    Code.expect(summaryViewModel.floodZone.isZone2).to.be.false()
    Code.expect(summaryViewModel.floodZone.isZone3).to.be.true()
    Code.expect(summaryViewModel.floodZone.isAreaBenefiting).to.be.false()
    Code.expect(summaryViewModel.floodZone.isZone1).to.be.false()
    Code.expect(summaryViewModel.easting).to.equal(361930)
    Code.expect(summaryViewModel.northing).to.equal(387463)
  })
})
