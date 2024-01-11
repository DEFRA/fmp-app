const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const createServer = require('../../server')
const floodMapView = require('../../server/routes/flood-map-view')
const sinon = require('sinon')
// const { JSDOM } = require('jsdom')

lab.experiment('flood-map', () => {
  let server
  let floodMapViewSpy
  const fzrUrlPolygon = '[[479472,484194],[479467,484032],[479678,484015],[479691,484176],[479472,484194]]'
  const floodMapUrl = `/flood-map?location=Pickering&polygon=${fzrUrlPolygon}&center=[479472,484194]`
  const inValidfloodMapUrl = '/flood-map'

  const getFloodMapResponse = async url => await server.inject({ method: 'GET', url })

  lab.before(async () => {
    floodMapViewSpy = sinon.spy(floodMapView, 'floodMapView')
    server = await createServer()
    await server.initialize()
  })

  lab.afterEach(async () => {
    floodMapViewSpy.resetHistory()
  })

  lab.after(async () => {
    sinon.restore()
  })

  lab.test('flood-map responds 200 with a valid url', async () => {
    const response = await getFloodMapResponse(floodMapUrl)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('flood-map redirects 500 with an invalid url', async () => {
    const response = await getFloodMapResponse(inValidfloodMapUrl)
    Code.expect(response.statusCode).to.equal(302)
  })

  lab.test('flood-map with a valid url should call h.view with expected parameters', async () => {
    await getFloodMapResponse(floodMapUrl)
    Code.expect(floodMapViewSpy.callCount).to.equal(1)
    const floodMapViewArguments = floodMapViewSpy.getCall(0).args[1]
    console.log('floodMapViewArguments', floodMapViewArguments)
  })
})
