'use strict'

const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const ViewModel = require('../../server/models/views/location')
const data = require('../data')

lab.experiment('Outlook model test', () => {
  let sandbox

  // Use a Sinon sandbox to manage spies, stubs and mocks for each test.
  lab.beforeEach(async () => {
    sandbox = await sinon.createSandbox()
  })
  lab.afterEach(async () => {
    await sandbox.restore()
  })
  lab.test('Test location viewModel a with flood warning', async () => {
    const floodWarning = data.floodWarning
    const viewModel = new ViewModel(floodWarning)

    const Result = await viewModel

    Code.expect(Result.floods[0].severitydescription).to.equal('Flood Warning')
    Code.expect(Result.place.name).to.equal('Keswick, Cumbria')
    Code.expect(Result.floodsPrimary).to.equal('1 flood warning is in force for <a href="/target-area/011FWFNC6KC">Keswick Campsite</a>. Some flooding is expected in this area.')
  })
  lab.test('Test location viewModel a with flood alert', async () => {
    const floodAlert = data.floodAlert
    const viewModel = new ViewModel(floodAlert)

    const Result = await viewModel

    Code.expect(Result.floodsPrimary).to.equal('A flood alert is in place for <a href="/target-area/011FWFNC6KC">Keswick Campsite</a>. Some flooding is possible in this area.')
    Code.expect(Result.floodsSecondary).to.equal('.')
  })
  lab.test('Test location viewModel a with Severe flood warning alert', async () => {
    const fakeSevereFloodWarning = data.severeFloodWarning
    const viewModel = new ViewModel(fakeSevereFloodWarning)

    const Result = await viewModel

    Code.expect(Result.floodsPrimary).to.equal('1 severe flood warning is in force for <a href="/target-area/011WAFDW">Upper River Derwent, Stonethwaite Beck and Derwent Water</a>. Severe flooding is expected in this area.')
    Code.expect(Result.floods.length).to.equal(1)
  })
  lab.test('Test location viewModel no warnings or alerts', async () => {
    const noWarningsOrAlerts = data.noWarningsOrAlerts
    const viewModel = new ViewModel(noWarningsOrAlerts)

    const Result = await viewModel

    Code.expect(Result.floods.length).to.equal(0)
  })
  lab.test('Test location viewModel with blank alert', async () => {
    const noFlooding = data.noFlooding
    const viewModel = new ViewModel(noFlooding)

    const Result = await viewModel

    Code.expect(Result.floods.length).to.equal(0)
  })
  lab.test('Test this.hasFloodsList with flood warning and alert', async () => {
    const warningAndAlert = data.warningAndAlert
    const viewModel = new ViewModel(warningAndAlert)

    const Result = await viewModel

    Code.expect(Result.floodsPrimary).to.equal('1 flood warning is in force . Some flooding is expected in this area.')
    Code.expect(Result.floodsSecondary).to.equal(' and 1 flood alert (some flooding is possible) is  in place in the wider area.')
  })
  lab.test('Test alternate primaryStatement with multiple Flood Alert', async () => {
    const multipleFloodAlerts = data.multipleFloodAlerts
    const viewModel = new ViewModel(multipleFloodAlerts)

    const Result = await viewModel

    Code.expect(Result.floodsPrimary).to.equal('2 flood alerts are in place . Some flooding is possible in this area.')
    Code.expect(Result.floodsSecondary).to.equal('.')
  })
  lab.test('Test alternate primaryStatement with multiple Flood Warnings', async () => {
    const multipleFloodWarnings = data.multipleFloodWarnings
    const viewModel = new ViewModel(multipleFloodWarnings)

    const Result = await viewModel

    Code.expect(Result.floodsPrimary).to.equal('3 flood warnings are in force . Some flooding is expected in this area.')
    Code.expect(Result.floodsSecondary).to.equal('')
  })
  lab.test('Test alternate primaryStatement with multiple Severe Flood Warnings', async () => {
    const multipleSevereFloodWarnings = data.multipleSevereFloodWarnings
    const viewModel = new ViewModel(multipleSevereFloodWarnings)

    const Result = await viewModel

    Code.expect(Result.floodsPrimary).to.equal('2 severe flood warnings are in force . Severe flooding is expected in this area.')
    Code.expect(Result.floodsSecondary).to.equal('.')
  })
  lab.test('Test Flood Warning at Coastal Station', async () => {
    const floodWarningCoastal = data.floodWarningCoastal
    const viewModel = new ViewModel(floodWarningCoastal)

    const Result = await viewModel

    Code.expect(Result.floodsPrimary).to.equal('1 flood warning is in force for <a href="/target-area/011TESTC6KC">Coastal Station</a>. Some flooding is expected in this area.')
    Code.expect(Result.floodsSecondary).to.equal('.')
  })
  lab.test('Test Station level get set to High', async () => {
    const floodWarningStationHigh = data.floodWarningStationHigh
    const viewModel = new ViewModel(floodWarningStationHigh)

    const Result = await viewModel

    Code.expect(Result.floodsPrimary).to.equal('1 flood warning is in force for <a href="/target-area/011TESTC6KC">High level Station</a>. Some flooding is expected in this area.')
    Code.expect(Result.floodsSecondary).to.equal('.')
  })
})
