const htmlParser = require('node-html-parser')
const {
  submitGetRequest,
  submitPostRequest,
  submitPostRequestExpectHandledError,
  submitPostRequestExpectServiceError
} = require('../../__test-helpers__/server')
const ngrToBngService = require('../../services/ngr-to-bng')
const addressService = require('../../services/address')
const isValidNgrService = require('../../services/is-valid-ngr')
const url = '/location'

describe('location route', () => {
  let server

  it(`Should return success response and correct view for ${url}`, async () => {
    const response = await submitGetRequest({ url }, 'Find the location')
    expect(htmlParser.parse(response.payload).querySelector('title').textContent).toContain('Find location - Flood map for planning - GOV.UK')
  })

  it('location page with location search error', async () => {
    const options = {
      url,
      payload: {
        findby: 'placeOrPostcode',
        placeOrPostcode: 'Warrington'
      }
    }

    addressService.findByPlace = function (place, callback) {
      callback(new Error('location error'))
    }
    await submitPostRequestExpectServiceError(options)
  })

  it('location page with rubbish to redirect', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'placeOrPostcode',
        placeOrPostcode: 'Warrington'
      }
    }

    addressService.findByPlace = function (place, callback) {
      callback(null, [])
    }

    await submitPostRequestExpectServiceError(options)
  })

  it('location page without placeOrPostcode', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'placeOrPostcode',
        placeOrPostcode: ''
      }
    }

    await submitPostRequestExpectHandledError(options, '<a href="#placeOrPostcode">Enter a real place name or postcode</a>')
  })

  it('location page without placeOrPostcode', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'placeOrPostcode'
      }
    }

    await submitPostRequestExpectHandledError(options, '<a href="#placeOrPostcode">Enter a real place name or postcode</a>')
  })

  it('location page without nationalGridReference', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'nationalGridReference',
        nationalGridReference: ''
      }
    }

    await submitPostRequestExpectHandledError(options, '<a href="#nationalGridReference">Enter a real National Grid Reference (NGR)</a>')
  })

  it('location page without nationalGridReference', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'nationalGridReference'
      }
    }

    await submitPostRequestExpectHandledError(options, '<a href="#nationalGridReference">Enter a real National Grid Reference (NGR)</a>')
  })

  it('location page with bad national grid reference', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'nationalGridReference',
        nationalGridReference: 'NY395557a'
      }
    }

    await submitPostRequestExpectHandledError(options, '<a href="#nationalGridReference">Enter a real National Grid Reference (NGR)</a>')
  })

  it('location page without an easting', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'eastingNorthing',
        northing: '123456'
      }
    }

    await submitPostRequestExpectHandledError(options, '<a href="#easting">Enter an easting</a>')
  })

  it('location page without an easting', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'eastingNorthing',
        easting: '',
        northing: '123456'
      }
    }

    await submitPostRequestExpectHandledError(options, '<a href="#easting">Enter an easting</a>')
  })

  it.only('location page without a northing', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'eastingNorthing',
        easting: '123456'
      }
    }

    await submitPostRequestExpectHandledError(options, '<a href="#northing">Enter a northing</a>')
  })

  it('location page without a northing', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'eastingNorthing',
        easting: '123456',
        northing: ''
      }
    }

    await submitPostRequestExpectHandledError(options, '<a href="#northing">Enter a northing</a>')
  })

  it('location page without an easting or northing', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'eastingNorthing'
      }
    }

    const response = await submitPostRequestExpectHandledError(options, '<a href="#northing">Enter a northing</a>')
    expect(response.payload).toContain('<a href="#easting">Enter an easting</a>')
  })

  it.only('location page without an easting or northing', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'eastingNorthing',
        easting: '',
        northing: ''
      }
    }

    const response = await submitPostRequestExpectHandledError(options, '<a href="#northing">Enter a northing</a>')
    expect(response.payload).toContain('<a href="#easting">Enter an easting</a>')
  })

  it.only('location page with bad easting from location', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'placeOrPostcode',
        placeOrPostcode: 'wa41ht'
      }
    }

    addressService.findByPlace = async (place) => {
      return [{ geometry_x: 300000 }]
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  it('location page with bad northing from location', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'placeOrPostcode',
        placeOrPostcode: 'wa41ht'
      }
    }

    addressService.findByPlace = async (place) => {
      return [{ geometry_y: 300000 }]
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })
  it('location page NGR fails to return easting but ok address', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'nationalGridReference',
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
    expect(response.statusCode).toBe(200)
  })

  it('location page NGR fails to return northing but ok address', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'nationalGridReference',
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
    expect(response.statusCode).toBe(200)
  })

  it('location page NGR fails', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'nationalGridReference',
        nationalGridReference: 'NN729575'
      }
    }

    ngrToBngService.convert = (term) => {
      return null
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  it('location page with invalid easting or northing integer', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'eastingNorthing',
        easting: 1232545655,
        northing: 465465412
      }
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  it('location page with negative easting or northing integer', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'eastingNorthing',
        easting: -12545,
        northing: -452165
      }
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  it('location page returns 200 when requested with legacy place param  - expect this to be via redirect from confirm-location', async () => {
    const options = {
      method: 'GET',
      url: '/location?place=co10 onn'
    }

    // Question: the model that is passed to the location view doesn't contain any of the query params (eg place in this example)
    // (see location.js lines 17-19) is this a bug?
    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  it('location page with placeOrPostcode AGAIN', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'placeOrPostcode',
        placeOrPostcode: 'Warrington'
      }
    }

    addressService.findByPlace = async (place) => {
      return [
        {
          geometry_x: 360799,
          geometry_y: 388244
        }
      ]
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  const validPayloads = [
    { findby: 'placeOrPostcode', placeOrPostcode: 'M1' },
    { findby: 'placeOrPostcode', placeOrPostcode: 'M33' },
    { findby: 'placeOrPostcode', placeOrPostcode: 'M1 1AA' },
    { findby: 'placeOrPostcode', placeOrPostcode: 'SK2' },
    { findby: 'placeOrPostcode', placeOrPostcode: 'SK2 7AT' },
    { findby: 'placeOrPostcode', placeOrPostcode: 'Lee' },
    { findby: 'placeOrPostcode', placeOrPostcode: 'Warrington' }
  ]
  validPayloads.forEach(async (requestPayload) => {
    it(
      `location page with a valid placeOrPostcode: ${requestPayload.placeOrPostcode} should redirect to /confirm-location`,
      async () => {
        const options = {
          method: 'POST',
          url,
          payload: requestPayload
        }

        addressService.findByPlace = async (place) => {
          return [
            {
              geometry_x: 360799,
              geometry_y: 388244
            }
          ]
        }

        const response = await server.inject(options)
        expect(response.statusCode).toBe(302)
        const { headers } = response
        expect(headers.location).toBe(
          '/map?cz=360799,388244,15'
        )
      }
    )
  })

  it('location page should pass locationDetails on to to /confirm-location', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'placeOrPostcode',
        placeOrPostcode: 'Warrington'
      }
    }
    addressService.findByPlace = async (place) => {
      return [
        {
          geometry_x: 360799,
          geometry_y: 388244,
          locationDetails: 'Wigtown, Dumfries and Galloway, Scotland'
        }
      ]
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(302)
    const { headers } = response
    expect(headers.location).toBe(
      '/map?cz=360799,388244,15'
    )
  })

  // Each of the following three payloads should have the same response - with the error "Enter a real place name or postcode"
  const invalidPayloads = [
    { findby: 'placeOrPostcode', placeOrPostcode: 'LE' },
    { findby: 'placeOrPostcode', placeOrPostcode: 'M' },
    { findby: 'placeOrPostcode' },
    { findby: 'placeOrPostcode', placeOrPostcode: ' ' },
    { findby: 'placeOrPostcode', placeOrPostcode: '123 Invalid' }
  ]
  invalidPayloads.forEach(async (requestPayload) => {
    it(`location page with placeOrPostcode: "${requestPayload.placeOrPostcode || 'undefined'}" should load /location view with errors`, async () => {
      const options = {
        method: 'POST',
        url,
        payload: requestPayload
      }

      addressService.findByPlace = async (place) => {
        return [
          {
            geometry_x: 360799,
            geometry_y: 388244
          }
        ]
      }

      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.request.path).toBe(url)
      expect(response.payload).toContain('<span class="govuk-visually-hidden">Error:</span> Enter a real place name or postcode')
      expect(response.payload).toContain('Error: Find location - Flood map for planning - GOV.UK')
    }
    )
  })

  const findByAddressResponse = [false, undefined, [], [{ geometry_x: 12345 }], [{ geometry_y: 12345 }]]
  findByAddressResponse.forEach((addressResponse) => {
    it(`location page with placeOrPostcode and findByAddressResponse: "${JSON.stringify(addressResponse)}" should load /location view with errors`, async () => {
      const options = {
        method: 'POST',
        url,
        payload: {
          findby: 'placeOrPostcode',
          placeOrPostcode: 'Warrington'
        }
      }

      addressService.findByPlace = async (place) => addressResponse
      const response = await server.inject(options)
      expect(response.statusCode).toBe(200)
      expect(response.request.path).toBe(url)
      expect(response.payload).toContain('<span class="govuk-visually-hidden">Error:</span> No address found for that place or postcode')
      expect(response.payload).toContain('<a href="#placeOrPostcode">Enter a real place name or postcode</a>')
    })
  })

  it('location page with nationalGridReference and ngrResponse: "[{ isValid: false }]" should load /location view with errors', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'nationalGridReference',
        nationalGridReference: 'TQ2770808448'
      }
    }

    isValidNgrService.get = async (ngr) => ({ isValid: false })
    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
    expect(response.request.path).toBe(url)
    expect(response.payload).toContain('<span class="govuk-visually-hidden">Error:</span> Enter a real National Grid Reference (NGR)')
    expect(response.payload).toContain('<a href="#nationalGridReference">Enter a real National Grid Reference (NGR)</a>')
  })

  it('location page with a valid nationalGridReference should redirect to /confirm-location', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'nationalGridReference',
        nationalGridReference: 'TQ2770808448'
      }
    }

    isValidNgrService.get = async (ngr) => ({ isValid: true })
    ngrToBngService.convert = (ngr) => ({ easting: 360799, northing: 388244 })

    const response = await server.inject(options)
    expect(response.statusCode).toBe(302)
    expect(response.headers.location).toBe('/map?cz=360799,388244,15')
  })

  it('location page with a valid eastingNorthing should redirect to /confirm-location', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'eastingNorthing',
        easting: '360799',
        northing: '388244'
      }
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(302)
    expect(response.headers.location).toBe('/map?cz=360799,388244,15')
  })

  it('location page findby eastingNorthing with missing easting and northing should should load /location view with errors', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'eastingNorthing'
      }
    }
    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
    expect(response.request.path).toBe(url)
    expect(response.payload).toContain('<span class="govuk-visually-hidden">Error:</span> Enter an easting')
    expect(response.payload).toContain('<span class="govuk-visually-hidden">Error:</span> Enter a northing')
    expect(response.payload).toContain('<a href="#easting">Enter an easting</a>')
    expect(response.payload).toContain('<a href="#northing">Enter a northing</a>')
  })

  it('location page findby eastingNorthing with invalid easting and northing should should load /location view with errors', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'eastingNorthing',
        easting: 'notvalid',
        northing: 'notvalid'
      }
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
    expect(response.request.path).toBe(url)
    expect(response.payload).toContain('<span class="govuk-visually-hidden">Error:<\/span> Enter an easting in the correct format')
    expect(response.payload).toContain('<span class="govuk-visually-hidden">Error:<\/span> Enter a northing in the correct format')
  })

  it('location page findby eastingNorthing with invalid easting should should load /location view with errors', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'eastingNorthing',
        easting: 'not valid',
        northing: '360799'
      }
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
    expect(response.request.path).toBe(url)
    expect(response.payload).toContain('<span class="govuk-visually-hidden">Error:<\/span> Enter an easting in the correct format')
    expect(response.payload).not.toContain('<span class="govuk-visually-hidden">Error:<\/span> Enter a northing in the correct format')
    expect(response.payload).toContain('<a href="#easting">Enter an easting in the correct format<\/a>')
    expect(response.payload).not.toContain('<a href="#northing">Enter a northing in the correct format<\/a>')
  })

  it('location page findby eastingNorthing with invalid northing should should load /location view with errors', async () => {
    const options = {
      method: 'POST',
      url,
      payload: {
        findby: 'eastingNorthing',
        easting: '360799',
        northing: 'not valid'
      }
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
    expect(response.request.path).toBe(url)
    expect(response.payload).not.toContain('<span class="govuk-visually-hidden">Error:<\/span> Enter an easting in the correct format')
    expect(response.payload).toContain('<span class="govuk-visually-hidden">Error:<\/span> Enter a northing in the correct format')
    expect(response.payload).not.toContain('<a href="#easting">Enter an easting in the correct format<\/a>')
    expect(response.payload).toContain('<a href="#northing">Enter a northing in the correct format<\/a>')
  })
})
