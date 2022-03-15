const Lab = require('lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const createServer = require('../../server')
const riskService = require('../../server/services/risk')
// const { payloadMatchTest } = require('../utils')
const Wreck = require('@hapi/wreck')
const config = require('../../config')

lab.experiment('flood-zone-results', async () => {
  let server
  let restoreGetByPolygon
  let restoreGetByPoint
  let restoreWreckPost

  lab.before(async () => {
    restoreGetByPolygon = riskService.getByPolygon
    restoreGetByPoint = riskService.getByPoint

    riskService.getByPolygon = () => ({ in_england: true })
    riskService.getByPoint = () => ({ point_in_england: true })

    restoreWreckPost = Wreck.post
    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    riskService.getByPolygon = restoreGetByPolygon
    riskService.getByPoint = restoreGetByPoint
    Wreck.post = restoreWreckPost
    await server.stop()
  })

  lab.test('a /pdf request without a payload should error', async () => {
    const options = {
      method: 'POST',
      url: '/pdf'
    }
    const response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(302)
    const { headers } = response
    Code.expect(headers.location).to.equal('/')
  })

  // payload: {
  //   id: Joi.number().required(),
  //   zone: Joi.string().required().allow('FZ1', 'FZ2', 'FZ3', 'FZ3a', ''),
  //   reference: Joi.string().allow('').max(13).trim(),
  //   scale: Joi.number().allow(2500, 10000, 25000, 50000).required(),
  //   polygon: Joi.string().required().allow(''),
  //   center: Joi.array().required().allow('')
  // }

  // server/routes/pdf.js missing coverage on line(s):  17-26, 29-31, 33, 35, 36, 40, 41, 61, 84, 97, 286-289, 296
  // server/routes/pdf.js missing coverage on line(s): 20, 24, 29-31, 33, 35, 36, 40, 41,         97,          296
  // server/routes/pdf.js missing coverage on line(s):     24, 29-31, 33, 35, 36, 40, 41,         97,          296
  // server/routes/pdf.js missing coverage on line(s):         29-31, 33, 35, 36,                              296

  const payloads = [
    ['empty-reference', { id: 1234, zone: 'FZ1', reference: '', scale: 2500, polygon: '', center: '' }],
    ['test-reference', { id: 1234, zone: 'FZ1', reference: 'testRef', scale: 2500, polygon: '', center: '' }],
    ['with polygon', { id: 1234, zone: 'FZ1', reference: 'testRef', scale: 2500, polygon: '[[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]', center: [1, 1] }]
  ]
  payloads.forEach(([testDescription, payload]) => {
    lab.test(`a /pdf request with a payload: ${testDescription} should call the geoserver print.pdf route`, async () => {
      const options = {
        method: 'POST',
        url: '/pdf',
        payload
      }
      let printUrl
      let postedPayload

      Wreck.post = async (url, options) => {
        printUrl = url
        postedPayload = options.payload
        return {}
      }

      const response = await server.inject(options)
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(printUrl).to.equal(config.geoserver + '/geoserver/pdf/print.pdf')
      Code.expect(postedPayload.reference).to.equal(payload.reference || '<Unspecified>')
      const { layers } = postedPayload
      Code.expect(layers.length).to.equal(3)
      const vector = layers[2]
      const expectedGraphicOffset = payload.polygon ? undefined : -10.5
      Code.expect(vector.styles[''].graphicXOffset).to.equal(expectedGraphicOffset)
    })
  })
})
