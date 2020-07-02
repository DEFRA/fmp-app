'use strict'

const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const Floods = require('../../server/services/rain')

lab.experiment('Rain service test', () => {
  lab.test('Check rain service exists', () => {
    Code.expect(Floods).to.be.a.object()
  })
})
