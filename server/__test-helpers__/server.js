const { getServer } = require('../../.jest/setup')
const constants = require('../constants')

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
  return submitRequest(options, expectedResponseCode)
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
  expect(document.querySelectorAll('.govuk-body')[1].textContent).toContain('We will fix this issue as soon as possible')
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
  submitPostRequestExpectServiceError
}
