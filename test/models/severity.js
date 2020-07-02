'use strict'

const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const Floods = require('../../server/models/severity')

lab.experiment('Severity model test', () => {
  lab.test('Check severity model exists', () => {
    Code.expect(Floods).to.be.an.array()
  })
})
