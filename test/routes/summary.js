const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const dbObjects = require('../models/get-fmp-zones')
const headers = require('../models/page-headers')
let server

const riskService = require('../../server/services/risk')

lab.experiment('Summary', async () => {
  lab.before(async () => {
    server = await require('../../')()
    // Mock the risk service get
    riskService.get = async (easting, northing) => {
      return dbObjects.zone1
    }
  })
  lab.test('Summary for zone 1', async () => {
    const options = {
      method: 'GET',
      url: '/summary/300000/400000'
    }

    // Mock the risk service get
    riskService.get = async (easting, northing) => {
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
      url: '/summary/300000/400000'
    }

    // Mock the risk service get
    riskService.get = async (easting, northing) => {
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
      url: '/summary/300000/400000'
    }

    // Mock the risk service get
    riskService.get = async (easting, northing) => {
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
      url: '/summary/300000/400000'
    }

    // Mock the risk service get
    riskService.get = async (easting, northing) => {
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
      url: '/summary/300000/400000'
    }

    // Mock the risk service get
    riskService.get = async (easting, northing) => {
      return dbObjects.notInEngland
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.payload).to.include(headers['not-england'].standard)
  })

  lab.test('Risk service error handle', async () => {
    const options = {
      method: 'GET',
      url: '/summary/300000/400000'
    }

    // Mock the risk service get
    riskService.get = async (easting, northing) => {
      throw new Error('Service error')
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(500)
    Code.expect(response.payload).to.include(headers[500])
  })

  lab.test('param validation easting 1', async () => {
    const options = {
      method: 'GET',
      url: '/summary/800000/400000'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.payload).to.include(headers[400])
  })

  lab.test('param validation easting 2', async () => {
    const options = {
      method: 'GET',
      url: '/summary/asfsaf/400000'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.payload).to.include(headers[400])
  })

  lab.test('param validation northing 1', async () => {
    const options = {
      method: 'GET',
      url: '/summary/300000/-250000'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.payload).to.include(headers[400])
  })

  lab.test('param validation northing 2', async () => {
    const options = {
      method: 'GET',
      url: '/summary/800000/dsfs'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.payload).to.include(headers[400])
  })

  lab.test('summary with no easting and northing returns 404 not found', async () => {
    const options = {
      method: 'GET',
      url: '/summary'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(404)
    Code.expect(response.payload).to.include(headers[404])
  })

  lab.test('summary with no easting and northing returns error page', async () => {
    const options = {
      method: 'GET',
      url: '/summary/dsgfsd/test'
    }

    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.payload).to.include(headers[400])
  })
})
