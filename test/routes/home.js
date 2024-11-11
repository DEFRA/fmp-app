require('dotenv').config({ path: 'config/.env-example' })
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const headers = require('../models/page-headers')
const addressService = require('../../server/services/address')
const createServer = require('../../server')
const { payloadMatchTest } = require('../utils')

lab.experiment('home', () => {
  let server

  lab.before(async () => {
    console.log('Creating server')
    server = await createServer()
    await server.initialize()

    addressService.findByPlace = async (place) => {
      return [
        {
          geometry_x: 300000,
          geometry_y: 400000
        }
      ]
    }
  })

  lab.after(async () => {
    console.log('Stopping server')
    await server.stop()
  })

  lab.test('home page returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.home.standard)
  })

  lab.test('unknown url returns 404', async () => {
    const options = {
      method: 'GET',
      url: '/jksfds'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(404)
  })

  lab.test(
    'home page returns 200 when requested with legacy place param  - expect this to be via redirect from confirm-location',
    async () => {
      const options = {
        method: 'GET',
        url: '/?place=co10 onn'
      }

      const response = await server.inject(options)
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.payload).to.include(headers.home.standard)
    }
  )

  lab.test('home page footer should contain OS link titled Ordance Survey (OS)', async () => {
    const options = { method: 'GET', url: '/' }

    const response = await server.inject(options)
    const { payload } = response

    await payloadMatchTest(payload, /<a href = "https:\/\/www.ordnancesurvey.co.uk\/">Ordnance Survey\(OS\)<\/a>/g)
    await payloadMatchTest(payload, /<a href="os-terms">Ordnance Survey terms and conditions<\/a>/g)
    await payloadMatchTest(payload, /<li>download a printable flood map for planning <\/li>/g)
    await payloadMatchTest(payload, /<li>request data for a flood risk assessment <\/li>/g)
    Code.expect(payload).to.not.include('100024198') // Old Os Number
    Code.expect(payload).to.include('AC0000807064') // New Os Number
  })
})
