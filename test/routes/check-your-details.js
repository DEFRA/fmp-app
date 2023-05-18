const Lab = require('@hapi/lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const createServer = require('../../server')
const Wreck = require('@hapi/wreck')
const config = require('../../config')
const { payloadMatchTest } = require('../utils')

const ApplicationReviewSummaryViewModel = require('../../server/models/check-your-details')

lab.experiment('check-your-details', () => {
  let server
  let restoreWreckPost
  let restoreGetPsoContactsByPolygon

  const eastAngliaPsoDetails = {
    EmailAddress: 'enquiries_eastanglia@environment-agency.gov.uk',
    AreaName: 'East Anglia',
    useAutomatedService: true,
    LocalAuthorities: 'Norfolk'
  }

  const yorkshirePsoDetails = {
    EmailAddress: 'psoContact@example.com',
    AreaName: 'Yorkshire',
    useAutomatedService: true,
    LocalAuthorities: 'Ryedale'
  }

  const orderProductFourResponse = { payload: '{ "applicationReferenceNumber": "123456" }' }

  lab.before(async () => {
    server = await createServer()
    await server.initialize()

    restoreWreckPost = Wreck.post
    restoreGetPsoContactsByPolygon = server.methods.getPsoContactsByPolygon
    server.methods.getPsoContactsByPolygon = async () => (yorkshirePsoDetails)
    Wreck.post = async (url, data) => ({ url, data })
  })

  lab.after(async () => {
    Wreck.post = restoreWreckPost
    server.methods.getPsoContactsByPolygon = restoreGetPsoContactsByPolygon
    await server.stop()
  })

  const confirmErrorRedirect = (response) => {
    const { result } = response
    Code.expect(response.statusCode).to.equal(500)
    Code.expect(result.match(/<h1 class="govuk-heading-xl">Sorry, there is a problem with the page you requested<\/h1>/g).length).to.equal(1)
  }

  lab.test('check-your-details with no query parameters should redirect to an error page', async () => {
    const options = {
      method: 'GET',
      url: '/check-your-details'
    }
    confirmErrorRedirect(await server.inject(options))
  })

  lab.test('check-your-details with easting only should redirect to an error page', async () => {
    const options = {
      method: 'GET',
      url: '/check-your-details?easting=12345'
    }

    confirmErrorRedirect(await server.inject(options))
  })

  lab.test('check-your-details with northing only should redirect to an error page', async () => {
    const options = {
      method: 'GET',
      url: '/check-your-details?northing=12345'
    }

    confirmErrorRedirect(await server.inject(options))
  })

  lab.test('check-your-details without a fullName should redirect to an error page', async () => {
    const options = {
      method: 'GET',
      url: '/check-your-details?easting=360799&northing=388244&recipientemail=joe@example.com'
    }

    confirmErrorRedirect(await server.inject(options))
  })

  lab.test('check-your-details without a recipientemail should redirect to an error page', async () => {
    const options = {
      method: 'GET',
      url: '/check-your-details?easting=360799&northing=388244&fullName=Joe%20Bloggs'
    }

    confirmErrorRedirect(await server.inject(options))
  })

  lab.test('check-your-details with easting, northing, fullname and recipient email should render view', async () => {
    const options = {
      method: 'GET',
      url: '/check-your-details?easting=360799&northing=388244&fullName=Joe%20Bloggs&recipientemail=joe@example.com'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)

    const { result, payload } = response
    Code.expect(result.match(/input type="hidden" value="360799" name="easting"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="388244" name="northing"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="joe@example.com" name="recipientemail"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="Joe Bloggs" name="fullName"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="joe@example.com" name="recipientemail"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="" name="zoneNumber"/g).length).to.equal(1)
    await payloadMatchTest(payload, /<figcaption class="govuk-visually-hidden" aria-hidden="false">[\s\S]*[ ]{1}An image of a map showing the site you have provided for the location for assessment[\s\S]*<\/figcaption>/g, 1)
  })

  lab.test('check-your-details with zoneNumber should render view with zoneNumber', async () => {
    const options = {
      method: 'GET',
      url: '/check-your-details?easting=360799&northing=388244&fullName=Joe%20Bloggs&recipientemail=joe@example.com&zoneNumber=13'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)

    const { result } = response
    Code.expect(result.match(/input type="hidden" value="360799" name="easting"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="388244" name="northing"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="joe@example.com" name="recipientemail"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="Joe Bloggs" name="fullName"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="joe@example.com" name="recipientemail"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="13" name="zoneNumber"/g).length).to.equal(1)
  })

  lab.test('check-your-details with polygon and centre should render view with polygon and cent', async () => {
    const options = {
      method: 'GET',
      url: '/check-your-details?easting=360799&northing=388244&fullName=Joe%20Bloggs&recipientemail=joe@example.com&polygon=[[479472,484194],[479467,484032],[479678,484015],[479691,484176],[479472,484194]]&center=[479579,484104]'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)

    const { result } = response
    Code.expect(result.match(/input type="hidden" value="360799" name="easting"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="388244" name="northing"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="\[\[479472,484194\],\[479467,484032\],\[479678,484015\],\[479691,484176\],\[479472,484194\]\]" name="polygon"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="\[479579,484104\]" name="cent"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="joe@example.com" name="recipientemail"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="Joe Bloggs" name="fullName"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="joe@example.com" name="recipientemail"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="" name="zoneNumber"/g).length).to.equal(1)
  })

  lab.test('check-your-details with location should render view with location', async () => {
    const options = {
      method: 'GET',
      url: '/check-your-details?easting=360799&northing=388244&fullName=Joe%20Bloggs&recipientemail=joe@example.com&location=Pickering'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)

    const { result } = response
    Code.expect(result.match(/input type="hidden" value="360799" name="easting"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="388244" name="northing"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="Pickering" name="location"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="" name="polygon"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="" name="cent"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="joe@example.com" name="recipientemail"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="Joe Bloggs" name="fullName"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="joe@example.com" name="recipientemail"/g).length).to.equal(1)
    Code.expect(result.match(/input type="hidden" value="" name="zoneNumber"/g).length).to.equal(1)
  })

  lab.test('check-your-details POST should repost to config.functionAppUrl/order-product-four', async () => {
    const options = {
      method: 'POST',
      url: '/check-your-details'
    }

    const postParams = {
      url: undefined,
      data: undefined
    }

    Wreck.post = async (url, data) => {
      postParams.url = url
      postParams.data = data
      return orderProductFourResponse
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(postParams.url).to.equal(config.functionAppUrl + '/order-product-four')
    Code.expect(postParams.data).to.equal({ payload: '{"x":0,"y":0,"polygon":"","location":"","areaName":"Yorkshire","psoEmailAddress":"psoContact@example.com"}' })
  })

  lab.test('check-your-details POST with easting and northing should repost to config.functionAppUrl/order-product-four', async () => {
    const options = {
      method: 'POST',
      url: '/check-your-details',
      payload: {
        easting: 12345,
        northing: 678910
      }
    }

    const postParams = {
      url: undefined,
      data: undefined
    }

    Wreck.post = async (url, data) => {
      postParams.url = url
      postParams.data = data
      return orderProductFourResponse
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(postParams.url).to.equal(config.functionAppUrl + '/order-product-four')
    Code.expect(postParams.data).to.equal({ payload: '{"x":12345,"y":678910,"polygon":"","location":"12345,678910","areaName":"Yorkshire","psoEmailAddress":"psoContact@example.com"}' })
  })

  lab.test('check-your-details POST without easting should repost to config.functionAppUrl/order-product-four without location set', async () => {
    const options = {
      method: 'POST',
      url: '/check-your-details',
      payload: {
        northing: 678910
      }
    }

    const postParams = {
      url: undefined,
      data: undefined
    }

    Wreck.post = async (url, data) => {
      postParams.url = url
      postParams.data = data
      return orderProductFourResponse
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(postParams.url).to.equal(config.functionAppUrl + '/order-product-four')
    Code.expect(postParams.data).to.equal({ payload: '{"x":0,"y":0,"polygon":"","location":"","areaName":"Yorkshire","psoEmailAddress":"psoContact@example.com"}' })
  })

  lab.test('check-your-details POST without northing should repost to config.functionAppUrl/order-product-four without location set', async () => {
    const options = {
      method: 'POST',
      url: '/check-your-details',
      payload: {
        easting: 678910
      }
    }

    const postParams = {
      url: undefined,
      data: undefined
    }

    Wreck.post = async (url, data) => {
      postParams.url = url
      postParams.data = data
      return orderProductFourResponse
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(postParams.url).to.equal(config.functionAppUrl + '/order-product-four')
    Code.expect(postParams.data).to.equal({ payload: '{"x":0,"y":0,"polygon":"","location":"","areaName":"Yorkshire","psoEmailAddress":"psoContact@example.com"}' })
  })

  lab.test('check-your-details POST with easting, northing and zoneNumber should repost to config.functionAppUrl/order-product-four', async () => {
    const options = {
      method: 'POST',
      url: '/check-your-details',
      payload: {
        easting: 12345,
        northing: 678910,
        zoneNumber: 10
      }
    }
    const restoreGetPsoContactsByPolygon = server.methods.getPsoContactsByPolygon
    server.methods.getPsoContactsByPolygon = async () => (eastAngliaPsoDetails)

    const postParams = {
      url: undefined,
      data: undefined
    }

    Wreck.post = async (url, data) => {
      postParams.url = url
      postParams.data = data
      return orderProductFourResponse
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(postParams.url).to.equal(config.functionAppUrl + '/order-product-four')
    Code.expect(postParams.data).to.equal({ payload: '{"x":12345,"y":678910,"polygon":"","location":"12345,678910","zoneNumber":10,"areaName":"East Anglia","psoEmailAddress":"enquiries_eastanglia@environment-agency.gov.uk"}' })
    const { headers } = response
    Code.expect(headers.location).to.equal('/confirmation?applicationReferenceNumber=123456&fullName=&polygon=&recipientemail=&x=12345&y=678910&location=12345%2C678910&zoneNumber=10&cent=')
    server.methods.getPsoContactsByPolygon = restoreGetPsoContactsByPolygon
  })

  lab.test('check-your-details POST with easting, northing and polygon should repost to config.functionAppUrl/order-product-four', async () => {
    const options = {
      method: 'POST',
      url: '/check-your-details',
      payload: {
        easting: 12345,
        northing: 678910,
        polygon: '[[479472,484194],[479467,484032],[479678,484015],[479691,484176],[479472,484194]]',
        cent: '[479579,484104]'
      }
    }

    server.methods.getPsoContactsByPolygon = async () => (eastAngliaPsoDetails)
    const postParams = {
      url: undefined,
      data: undefined
    }

    Wreck.post = async (url, data) => {
      postParams.url = url
      postParams.data = data
      return orderProductFourResponse
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(postParams.url).to.equal(config.functionAppUrl + '/order-product-four')
    Code.expect(postParams.data).to.equal({ payload: '{"x":12345,"y":678910,"polygon":"[[[479472,484194],[479467,484032],[479678,484015],[479691,484176],[479472,484194]]]","location":"12345,678910","plotSize":"3.49","areaName":"East Anglia","psoEmailAddress":"enquiries_eastanglia@environment-agency.gov.uk"}' })
    const { headers } = response
    Code.expect(headers.location).to.equal('/confirmation?applicationReferenceNumber=123456&fullName=&polygon=%5B%5B479472%2C484194%5D%2C%5B479467%2C484032%5D%2C%5B479678%2C484015%5D%2C%5B479691%2C484176%5D%2C%5B479472%2C484194%5D%5D&recipientemail=&x=12345&y=678910&location=12345%2C678910&zoneNumber=&cent=%5B479579%2C484104%5D')
  })

  lab.test('check-your-details POST with easting, northing and location should repost to config.functionAppUrl/order-product-four', async () => {
    const options = {
      method: 'POST',
      url: '/check-your-details',
      payload: {
        easting: 12345,
        northing: 678910,
        location: 'Pickering'
      }
    }

    server.methods.getPsoContactsByPolygon = async () => (eastAngliaPsoDetails)

    const postParams = {
      url: undefined,
      data: undefined
    }

    Wreck.post = async (url, data) => {
      postParams.url = url
      postParams.data = data
      return orderProductFourResponse
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(postParams.url).to.equal(config.functionAppUrl + '/order-product-four')

    // Question - Is this correct - polygon seems to be passed in a variety of ways
    Code.expect(postParams.data).to.equal({ payload: '{"x":12345,"y":678910,"polygon":"","location":"Pickering","areaName":"East Anglia","psoEmailAddress":"enquiries_eastanglia@environment-agency.gov.uk"}' })

    const { headers } = response
    Code.expect(headers.location).to.equal('/confirmation?applicationReferenceNumber=123456&fullName=&polygon=&recipientemail=&x=12345&y=678910&location=Pickering&zoneNumber=&cent=')
  })

  lab.test('ApplicationReviewSummaryViewModel with data', async () => {
    const PDFinformationDetailsObject = { value: 'test' }
    const contacturl = 'http://example.com/contact'
    const confirmlocationurl = 'http://example.com/confirm'
    const data = { PDFinformationDetailsObject, contacturl, confirmlocationurl }
    const applicationReviewSummaryViewModel = new ApplicationReviewSummaryViewModel(data)
    Code.expect(applicationReviewSummaryViewModel).to.equal(data)
  })

  lab.test('ApplicationReviewSummaryViewModel without data', async () => {
    const applicationReviewSummaryViewModel = new ApplicationReviewSummaryViewModel()
    Code.expect(applicationReviewSummaryViewModel).to.equal({})
  })

  lab.test('ApplicationReviewSummaryViewModel with empty data object', async () => {
    const applicationReviewSummaryViewModel = new ApplicationReviewSummaryViewModel({})
    Code.expect(applicationReviewSummaryViewModel).to.equal({})
  })
})
