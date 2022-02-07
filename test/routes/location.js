const Lab = require('lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
// const headers = require('../models/page-headers')
const ngrToBngService = require('../../server/services/ngr-to-bng')
const addressService = require('../../server/services/address')
const createServer = require('../../server')

lab.experiment('location', async () => {
  let server

  lab.before(async () => {
    console.log('Creating server')
    server = await createServer()
    await server.initialize()

    addressService.findByPlace = async (place) => {
      return [{
        geometry_x: 300000,
        geometry_y: 400000
      }]
    }
  })

  lab.after(async () => {
    console.log('Stopping server')
    await server.stop()
  })

  lab.test('location page with ngr', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'nationalGridReference',
        nationalGridReference: 'TQ2770808448'
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('location page with placeOrPostcode', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: 'Warrington'
      }
    }

    addressService.findByPlace = async (place) => {
      return [{
        geometry_x: 360799,
        geometry_y: 388244
      }]
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('location page with location search error', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: 'Warrington'
      }
    }

    addressService.findByPlace = function (place, callback) {
      callback(new Error('location error'))
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('location page with rubbish to redirect', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: 'Warrington'
      }
    }

    addressService.findByPlace = function (place, callback) {
      callback(null, [])
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('location page without placeOrPostcode', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: ''
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('location page without placeOrPostcode', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'placeOrPostcode'
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('location page without nationalGridReference', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'nationalGridReference',
        nationalGridReference: ''
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('location page without nationalGridReference', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'nationalGridReference'
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('location page with bad national grid reference', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'nationalGridReference',
        nationalGridReference: 'NY395557a'
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('location page without an easting', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'eastingNorthing',
        northing: 123456
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('location page without an easting', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'eastingNorthing',
        easting: NaN,
        northing: 123456
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('location page without a northing', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'eastingNorthing',
        easting: 123456
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('location page without a northing', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'eastingNorthing',
        easting: 123456,
        northing: NaN
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('location page without an easting or northing', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'eastingNorthing'
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('location page without an easting or northing', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'eastingNorthing',
        easting: NaN,
        northing: NaN
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('location page with bad easting from location', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: 'wa41ht'
      }
    }

    addressService.findByPlace = async (place) => {
      return [{ geometry_x: 300000 }]
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('location page with bad northing from location', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'placeOrPostcode',
        placeOrPostcode: 'wa41ht'
      }
    }

    addressService.findByPlace = async (place) => {
      return [{ geometry_y: 300000 }]
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })
  lab.test('location page NGR fails to return easting but ok address', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'nationalGridReference',
        nationalGridReference: 'NN729575'
      }
    }

    ngrToBngService.convert = (term) => {
      return {
        easting: null,
        northing: 100000
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('location page NGR fails to return northing but ok address', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'nationalGridReference',
        nationalGridReference: 'NN729575'
      }
    }

    ngrToBngService.convert = (term) => {
      return {
        easting: 100000,
        northing: null
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('location page NGR fails', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'nationalGridReference',
        nationalGridReference: 'NN729575'
      }
    }

    ngrToBngService.convert = (term) => {
      return null
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('location page with invalid easting or northing integer', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'eastingNorthing',
        easting: 1232545655,
        northing: 465465412
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('location page with negative easting or northing integer', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        type: 'eastingNorthing',
        easting: -12545,
        northing: -452165
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('location page returns 200 when requested with legacy place param  - expect this to be via redirect from confirm-location', async () => {
    const options = {
      method: 'GET',
      url: '/location/?place=co10 onn'
    }

    const response = await await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })
})
