const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const createServer = require('../../server')
const riskService = require('../../server/services/risk')
const Wreck = require('@hapi/wreck')
const config = require('../../config')

lab.experiment('PDF', () => {
  let server
  let restoreGetByPolygon
  let restoreWreckPost

  lab.before(async () => {
    restoreGetByPolygon = riskService.getByPolygon

    riskService.getByPolygon = () => ({ in_england: true })
    riskService.getByPoint = () => ({ point_in_england: true })

    restoreWreckPost = Wreck.post
    server = await createServer()
    await server.initialize()
  })

  lab.after(async () => {
    riskService.getByPolygon = restoreGetByPolygon
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

  const payloads = [
    ['empty-reference', { reference: '', scale: 2500, polygon: '', center: '[1, 1]' }],
    ['test-reference', { reference: 'testRef', scale: 2500, polygon: '', center: '[1, 1]' }],
    [
      'with polygon',
      { reference: 'testRef', scale: 2500, polygon: '[[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]', center: '[1, 1]' }
    ],
    [
      'with polygon without zone',
      { reference: 'testRef', scale: 2500, polygon: '[[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]', center: '[1, 1]' }
    ],
    ['without polygon without zone', { reference: 'testRef', scale: 2500, polygon: '', center: '[1, 1]' }]
  ]
  payloads.forEach(([testDescription, payload]) => {
    lab.test(
      `a /pdf request with a payload: ${testDescription} should call the geoserver print.pdf route`,
      async () => {
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
        Code.expect(response.statusCode).to.equal(204)
        Code.expect(printUrl).to.equal(config.geoserver + '/geoserver/pdf/print.pdf')
        Code.expect(postedPayload.reference).to.equal(payload.reference || '<Unspecified>')
        const { layers } = postedPayload
        Code.expect(layers.length).to.equal(3)
        const vector = layers[2]
        const expectedGraphicOffset = payload.polygon ? undefined : -10.5
        Code.expect(vector.styles[''].graphicXOffset).to.equal(expectedGraphicOffset)
      }
    )
  })

  /*eslint-disable */
  const postErrorFunctions = [
    async (url, options) => {throw new Error('testing error')},
    async (url, options) => {throw undefined},
    async (url, options) => {throw 'a string'},
  ]
 /* eslint-enable */
  postErrorFunctions.forEach((postErrorFunction) => {
    lab.test('a /pdf request should return an internal error if Wreck.post fails', async () => {
      const payload = payloads[0][1]
      const options = { method: 'POST', url: '/pdf', payload }

      Wreck.post = postErrorFunction

      const response = await server.inject(options)
      Code.expect(response.statusCode).to.equal(500)
    })
  })
})
