const constants = require('../constants')
const createServer = require('../../server')
let server

beforeEach(async () => {
  jest.useFakeTimers({ advanceTimers: true })
  jest.setSystemTime(new Date(2025, 1, 1)) // Fix unit tests to 2025 to stop snapshots failing where there is a date displayed
  server = await createServer()
  await server.initialize()
})

afterEach(async () => {
  jest.useRealTimers()
  await server.stop()
})

const getServer = () => server

const submitGetRequest = async (options, header, expectedResponseCode = constants.statusCodes.OK) => {
  options.method = 'GET'
  const response = await submitRequest(options, expectedResponseCode)
  if (header) {
    document.body.innerHTML = response.payload
    expect(document.querySelector('h1').textContent).toContain(header)
  }
  return response
}

const submitPostRequest = async (options, expectedResponseCode = constants.statusCodes.REDIRECT) => {
  options.method = 'POST'
  const response = await submitRequest(options, expectedResponseCode)
  return response
}

const submitPostRequestExpectHandledError = async (options, errorMessage) => {
  options.method = 'POST'
  const response = await submitRequest(options, constants.statusCodes.OK)
  expect(response.payload).toContain('There is a problem')
  if (errorMessage) {
    expect(response.payload).toContain(errorMessage)
  }
  return response
}

const submitPostRequestExpectServiceError = async (options) => {
  options.method = 'POST'
  const response = await submitRequest(options, constants.statusCodes.PROBLEM_WITH_SERVICE)
  document.body.innerHTML = response.payload
  expect(document.querySelector('h1').textContent).toContain('Sorry, there is a problem with the page you requested')
  expect(document.querySelector('h1 + p').textContent).toContain('We will fix this issue as soon as possible')
  return response
}

const submitRequest = async (options, expectedResponseCode) => {
  const response = await getServer().inject(options)
  expect(response.statusCode).toBe(expectedResponseCode)
  return response
}

module.exports = {
  submitGetRequest,
  submitPostRequest,
  submitPostRequestExpectHandledError,
  submitPostRequestExpectServiceError,
  getServer
}
