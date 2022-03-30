const Lab = require('lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const ngrToBngService = require('../../server/services/ngr-to-bng')
const addressService = require('../../server/services/address')
const isValidNgrService = require('../../server/services/is-valid-ngr')
const createServer = require('../../server')
const { payloadMatchTest, titleTest } = require('../utils')

lab.experiment('location', async () => {
  let server
  let restoreIsValidNgrService
  let restoreFindByPlaceService

  lab.before(async () => {
    console.log('Creating server')
    server = await createServer()
    await server.initialize()
    restoreIsValidNgrService = isValidNgrService.get
    restoreFindByPlaceService = addressService.findByPlace

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
    isValidNgrService.get = restoreIsValidNgrService
    addressService.findByPlace = restoreFindByPlaceService
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
      url: '/location?place=co10 onn'
    }

    // Question: the model that is passed to the location view doesn't contain any of the query params (eg place in this example)
    // (see location.js lines 17-19) is this a bug?
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('location title should not contain Error prefix ', async () => {
    const options = { method: 'GET', url: '/location' }
    const response = await server.inject(options)
    const { payload } = response
    Code.expect(response.statusCode).to.equal(200)
    await titleTest(payload, 'Find location - Flood map for planning - GOV.UK')
  })

  lab.test('location page with placeOrPostcode AGAIN', async () => {
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

  lab.test('location page with a valid placeOrPostcode should redirect to /confirm-location', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        findby: 'placeOrPostcode',
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
    Code.expect(response.statusCode).to.equal(302)
    const { headers } = response
    Code.expect(headers.location).to.equal('/confirm-location?easting=360799&northing=388244&placeOrPostcode=Warrington&recipientemail=%20&fullName=%20')
  })

  // Each of the following three payloads should have the same response - with the error "Enter a real place name or postcode"
  const payloads = [
    { findby: 'placeOrPostcode' },
    { findby: 'placeOrPostcode', placeOrPostcode: ' ' },
    { findby: 'placeOrPostcode', placeOrPostcode: '123 Invalid' }
  ]
  payloads.forEach(async (requestPayload) => {
    lab.test(`location page with placeOrPostcode: "${requestPayload.placeOrPostcode || 'undefined'}" should load /location view with errors`, async () => {
      const options = {
        method: 'POST',
        url: '/location',
        payload: requestPayload
      }

      addressService.findByPlace = async (place) => {
        return [{
          geometry_x: 360799,
          geometry_y: 388244
        }]
      }

      const response = await server.inject(options)
      Code.expect(response.statusCode).to.equal(200)
      const { request, payload } = response
      const { path } = request
      Code.expect(path).to.equal('/location')
      await payloadMatchTest(payload, /<span class="govuk-visually-hidden">Error:<\/span> Enter a real place name or postcode/g)
      await payloadMatchTest(payload, /<a href="#placeOrPostcode">Enter a real place name or postcode<\/a>/g)
      await titleTest(payload, 'Error: Find location - Flood map for planning - GOV.UK')
    })
  })

  const findByAddressResponse = [
    false,
    undefined,
    [],
    [{ geometry_x: 12345 }],
    [{ geometry_y: 12345 }]
  ]
  findByAddressResponse.forEach((addressResponse) => {
    lab.test(`location page with placeOrPostcode and findByAddressResponse: "${JSON.stringify(addressResponse)}" should load /location view with errors`, async () => {
      const options = {
        method: 'POST',
        url: '/location',
        payload: {
          findby: 'placeOrPostcode',
          placeOrPostcode: 'Warrington'
        }
      }

      addressService.findByPlace = async (place) => addressResponse

      const response = await server.inject(options)
      Code.expect(response.statusCode).to.equal(200)
      const { request, payload } = response
      const { path } = request
      Code.expect(path).to.equal('/location')
      await payloadMatchTest(payload, /<span class="govuk-visually-hidden">Error:<\/span> No address found for that place or postcode/g)
      await payloadMatchTest(payload, /<a href="#placeOrPostcode">Enter a real place name or postcode<\/a>/g)
    })
  })

  lab.test('location page with nationalGridReference and ngrResponse: "[{ isValid: false }]" should load /location view with errors', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        findby: 'nationalGridReference',
        nationalGridReference: 'TQ2770808448'
      }
    }

    isValidNgrService.get = async (ngr) => ({ isValid: false })

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    const { request, payload } = response
    const { path } = request
    Code.expect(path).to.equal('/location')
    await payloadMatchTest(payload, /<span class="govuk-visually-hidden">Error:<\/span> Enter a real National Grid Reference \(NGR\)/g)
    await payloadMatchTest(payload, /<a href="#nationalGridReference">Enter a real National Grid Reference \(NGR\)<\/a>/g)
  })

  lab.test('location page with a valid nationalGridReference should redirect to /confirm-location', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        findby: 'nationalGridReference',
        nationalGridReference: 'TQ2770808448'
      }
    }

    isValidNgrService.get = async (ngr) => ({ isValid: true })
    ngrToBngService.convert = (ngr) => ({ easting: 360799, northing: 388244 })

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    const { headers } = response
    Code.expect(headers.location).to.equal('/confirm-location?easting=360799&northing=388244&nationalGridReference=TQ2770808448&recipientemail=%20&fullName=%20')
  })

  lab.test('location page with a valid nationalGridReference should redirect to /confirm-location if ngrToBngService.convert returns an empty response', async () => {
    // NOTE - This may be an invalid test but it adds coverage for lines 154-155
    // it may be more correct for this state to generate an internal error if ngrToBngService.convert returns an empty object {}
    // 154 queryParams.easting = BNG.easting || ''
    // 155 queryParams.northing = BNG.northing || ''
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        findby: 'nationalGridReference',
        nationalGridReference: 'TQ2770808448'
      }
    }

    isValidNgrService.get = async (ngr) => ({ isValid: true })
    ngrToBngService.convert = (ngr) => ({ })

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    const { headers } = response
    Code.expect(headers.location).to.equal('/confirm-location?easting=&northing=&nationalGridReference=TQ2770808448&recipientemail=%20&fullName=%20')
  })

  lab.test('location page with a valid eastingNorthing should redirect to /confirm-location', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        findby: 'eastingNorthing',
        easting: '360799',
        northing: '388244'
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    const { headers } = response
    Code.expect(headers.location).to.equal('/confirm-location?easting=360799&northing=388244&recipientemail=%20&fullName=%20')
  })

  lab.test('location page findby eastingNorthing with missing easting and northing should should load /location view with errors', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        findby: 'eastingNorthing'
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    const { request, payload } = response
    const { path } = request
    Code.expect(path).to.equal('/location')
    await payloadMatchTest(payload, /<span class="govuk-visually-hidden">Error:<\/span> Enter an easting/g)
    await payloadMatchTest(payload, /<span class="govuk-visually-hidden">Error:<\/span> Enter a northing/g)
    await payloadMatchTest(payload, /<a href="#easting">Enter an easting<\/a>/g)
    await payloadMatchTest(payload, /<a href="#northing">Enter a northing<\/a>/g)
  })

  lab.test('location page findby eastingNorthing with invalid easting and northing should should load /location view with errors', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        findby: 'eastingNorthing',
        easting: 'notvalid',
        northing: 'notvalid'
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    const { request, payload } = response
    const { path } = request
    Code.expect(path).to.equal('/location')
    await payloadMatchTest(payload, /<span class="govuk-visually-hidden">Error:<\/span> Enter an easting in the correct format/g)
    await payloadMatchTest(payload, /<span class="govuk-visually-hidden">Error:<\/span> Enter a northing in the correct format/g)
    await payloadMatchTest(payload, /<a href="#easting">Enter an easting in the correct format<\/a>/g)
    await payloadMatchTest(payload, /<a href="#northing">Enter a northing in the correct format<\/a>/g)
  })

  lab.test('location page findby eastingNorthing with invalid easting should should load /location view with errors', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        findby: 'eastingNorthing',
        easting: 'not valid',
        northing: '360799'
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    const { request, payload } = response
    const { path } = request
    Code.expect(path).to.equal('/location')
    await payloadMatchTest(payload, /<span class="govuk-visually-hidden">Error:<\/span> Enter an easting in the correct format/g, 1)
    await payloadMatchTest(payload, /<span class="govuk-visually-hidden">Error:<\/span> Enter a northing in the correct format/g, 0)
    await payloadMatchTest(payload, /<a href="#easting">Enter an easting in the correct format<\/a>/g, 1)
    await payloadMatchTest(payload, /<a href="#northing">Enter a northing in the correct format<\/a>/g, 0)
  })

  lab.test('location page findby eastingNorthing with invalid northing should should load /location view with errors', async () => {
    const options = {
      method: 'POST',
      url: '/location',
      payload: {
        findby: 'eastingNorthing',
        easting: '360799',
        northing: 'not valid'
      }
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    const { request, payload } = response
    const { path } = request
    Code.expect(path).to.equal('/location')
    await payloadMatchTest(payload, /<span class="govuk-visually-hidden">Error:<\/span> Enter an easting in the correct format/g, 0)
    await payloadMatchTest(payload, /<span class="govuk-visually-hidden">Error:<\/span> Enter a northing in the correct format/g, 1)
    await payloadMatchTest(payload, /<a href="#easting">Enter an easting in the correct format<\/a>/g, 0)
    await payloadMatchTest(payload, /<a href="#northing">Enter a northing in the correct format<\/a>/g, 1)
  })
})
