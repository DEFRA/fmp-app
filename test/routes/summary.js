const Lab = require('lab')
const Code = require('code')
const glupe = require('glupe')
const lab = exports.lab = Lab.script()
const QueryString = require('querystring')
const URL = require('url')
const dbObjects = require('../models/get-fmp-zones')
const headers = require('../models/page-headers')
const riskService = require('../../server/services/risk')
const { manifest, options } = require('../../server')

lab.experiment('Summary', async () => {
  let server

  lab.before(async () => {
    server = await glupe.compose(manifest, options)

    // Mock the risk service get
    riskService.getByPoint = async (easting, northing) => {
      return dbObjects.zone1
    }
  })

  lab.test('Summary for zone 1', async () => {
    const options = {
      method: 'GET',
      url: '/summary?easting=300000&northing=400000'
    }

    // Mock the risk service get
    riskService.getByPoint = async (easting, northing) => {
      return dbObjects.zone1
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.summary.standard)
    Code.expect(response.payload).to.include(headers.summary.zone1)
  })

  lab.test('Summary for zone 2', async () => {
    const options = {
      method: 'GET',
      url: '/summary?easting=300000&northing=400000'
    }

    // Mock the risk service get
    riskService.getByPoint = async (easting, northing) => {
      return dbObjects.zone2
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.summary.standard)
    Code.expect(response.payload).to.include(headers.summary.zone2)
  })

  lab.test('Summary for zone 3', async () => {
    const options = {
      method: 'GET',
      url: '/summary?easting=300000&northing=400000'
    }

    // Mock the risk service get
    riskService.getByPoint = async (easting, northing) => {
      return dbObjects.zone3
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.summary.standard)
    Code.expect(response.payload).to.include(headers.summary.zone3)
  })

  lab.test('Summary for zone 3 area benefitting', async () => {
    const options = {
      method: 'GET',
      url: '/summary?easting=300000&northing=400000'
    }

    // Mock the risk service get
    riskService.getByPoint = async (easting, northing) => {
      return dbObjects.areaBenefiting
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers.summary.standard)
    Code.expect(response.payload).to.include(headers.summary.zone3)
    Code.expect(response.payload).to.include(headers.summary.zoneAreaBen)
  })

  lab.test('Not in england hit to render not-england page', async () => {
    const options = {
      method: 'GET',
      url: '/summary?easting=300000&northing=400000'
    }

    // Mock the risk service get
    riskService.getByPoint = async (easting, northing) => {
      return dbObjects.notInEngland
    }

    const response = await server.inject(options)
    const responseURL = URL.parse(response.headers.location)
    const responseQueryParams = QueryString.parse(responseURL.query)
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(responseURL.pathname).to.equal('not-england')
    Code.expect(responseQueryParams.easting).to.equal('300000')
    Code.expect(responseQueryParams.northing).to.equal('400000')
  })

  lab.test('Not in england polygon to render not-england page with centroid flag', async () => {
    const options = {
      method: 'GET',
      url: '/summary?polygon=[[327586,365365],[328062,364497],[327390,364525],[327586,365365]]&center=[327726,364931]'
    }

    // Mock the risk service get
    riskService.getByPolygon = async (polygon) => {
      return dbObjects.notInEngland
    }

    const response = await server.inject(options)
    const responseURL = URL.parse(response.headers.location)
    const responseQueryParams = QueryString.parse(responseURL.query)
    Code.expect(response.statusCode).to.equal(302)
    Code.expect(responseURL.pathname).to.equal('not-england')
    Code.expect(responseQueryParams.easting).to.equal('327726')
    Code.expect(responseQueryParams.northing).to.equal('364931')
    Code.expect(responseQueryParams.centroid).to.be.equal('true')
  })

  lab.test('Risk service error handle', async () => {
    const options = {
      method: 'GET',
      url: '/summary?easting=300000&northing=400000'
    }

    // Mock the risk service get
    riskService.getByPoint = async (easting, northing) => {
      throw new Error('Service error')
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(500)
    Code.expect(response.payload).to.include(headers[500])
  })

  lab.test('param validation easting 1', async () => {
    const options = {
      method: 'GET',
      url: '/summary?easting=800000&northing=400000'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.payload).to.include(headers[400])
  })

  lab.test('param validation easting 2', async () => {
    const options = {
      method: 'GET',
      url: '/summary?easting=asfsaf&northing=400000'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.payload).to.include(headers[400])
  })

  lab.test('param validation northing 1', async () => {
    const options = {
      method: 'GET',
      url: '/summary?easting=300000&northing=-250000'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.payload).to.include(headers[400])
  })

  lab.test('param validation northing 2', async () => {
    const options = {
      method: 'GET',
      url: '/summary?easting=800000&northing=dsfs'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.payload).to.include(headers[400])
  })

  lab.test('summary with no easting and northing returns 400', async () => {
    const options = {
      method: 'GET',
      url: '/summary'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.payload).to.include(headers[400])
  })

  lab.test('summary with no easting and northing returns error page', async () => {
    const options = {
      method: 'GET',
      url: '/summary?easting=dsfs&northing=test'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.payload).to.include(headers[400])
  })
})
