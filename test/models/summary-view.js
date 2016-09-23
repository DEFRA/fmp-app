var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Code = require('code')
var SummaryViewModel = require('../../server/models/summary-view')
// Test data objects

var testObjects = require('./get-fmp-zones')

lab.experiment('summary-view view model tests', function () {
  lab.test('zone1', function (done) {
    var summaryViewModel = new SummaryViewModel(300000, 400000, testObjects.zone1)

    Code.expect(summaryViewModel.isZone2).to.be.false()
    Code.expect(summaryViewModel.isZone3).to.be.false()
    Code.expect(summaryViewModel.isAreaBenefiting).to.be.false()
    Code.expect(summaryViewModel.isZone1).to.be.true()
    Code.expect(summaryViewModel.easting).to.equal(300000)
    Code.expect(summaryViewModel.northing).to.equal(400000)
    done()
  })

  lab.test('zone2', function (done) {
    var summaryViewModel = new SummaryViewModel(300000, 400000, testObjects.zone2)

    Code.expect(summaryViewModel.isZone2).to.be.true()
    Code.expect(summaryViewModel.isZone3).to.be.false()
    Code.expect(summaryViewModel.isAreaBenefiting).to.be.false()
    Code.expect(summaryViewModel.isZone1).to.be.false()
    Code.expect(summaryViewModel.easting).to.equal(300000)
    Code.expect(summaryViewModel.northing).to.equal(400000)
    done()
  })

  lab.test('zone3', function (done) {
    var summaryViewModel = new SummaryViewModel(300000, 400000, testObjects.zone3)

    Code.expect(summaryViewModel.isZone2).to.be.false()
    Code.expect(summaryViewModel.isZone3).to.be.true()
    Code.expect(summaryViewModel.isAreaBenefiting).to.be.false()
    Code.expect(summaryViewModel.isZone1).to.be.false()
    Code.expect(summaryViewModel.easting).to.equal(300000)
    Code.expect(summaryViewModel.northing).to.equal(400000)
    done()
  })

  lab.test('area benefiting', function (done) {
    var summaryViewModel = new SummaryViewModel(300000, 400000, testObjects.areaBenefiting)

    Code.expect(summaryViewModel.isZone2).to.be.false()
    Code.expect(summaryViewModel.isZone3).to.be.false()
    Code.expect(summaryViewModel.isAreaBenefiting).to.be.true()
    Code.expect(summaryViewModel.isZone1).to.be.false()
    Code.expect(summaryViewModel.easting).to.equal(300000)
    Code.expect(summaryViewModel.northing).to.equal(400000)
    done()
  })
})
