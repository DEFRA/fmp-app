const { getServer } = require('../../.jest/setup')
const { parse } = require('node-html-parser')
// import onPreAuth from './on-pre-auth.js'
// import { parse } from 'node-html-parser'
// import constants from '../utils/constants.js'

const submitGetRequest = async (options, header, expectedResponseCode = 200, sessionData = {}) => {
  // if (Object.keys(sessionData).length > 0) {
  //   await addOnPreAuth(sessionData)
  // }
  options.method = 'GET'
  const response = await submitRequest(options, expectedResponseCode)
  if (header) {
    const html = parse(response.payload)
    expect(html.querySelector('h1').textContent).toContain(header)
  }
  return response
}

const submitPostRequest = async (options, expectedResponseCode = 304, sessionData = {}) => {
  // if (Object.keys(sessionData).length > 0) {
  //   await addOnPreAuth(sessionData)
  // }
  options.method = 'POST'
  return submitRequest(options, expectedResponseCode)
}

const submitPostRequestExpectHandledError = async (options, errorMessage) => {
  options.method = 'POST'
  const response = await submitRequest(options, 200)
  expect(response.payload).toContain('There is a problem')
  expect(response.payload).toContain(errorMessage)
  return response
}

const submitPostRequestExpectServiceError = async (options) => {
  options.method = 'POST'
  const response = await submitRequest(options, 500)
  const html = parse(response.payload)
  expect(html.querySelector('h1').textContent).toContain('Sorry, there is a problem with the page you requested')
  expect(html.querySelectorAll('.govuk-body')[1].textContent).toContain('We will fix this issue as soon as possible')
  return response
}

const submitRequest = async (options, expectedResponseCode) => {
  // // tests can pass in their own auth object
  // if (!Object.hasOwn(options, 'auth')) {
  //   // Add in some default credentials to pass authentication on routes
  //   options.auth = {
  //     strategy: 'session-auth',
  //     credentials: {
  //       id: 1,
  //       fullName: 'John Smith',
  //       phone: '012345678910'
  //     }
  //   }
  // }
  const response = await getServer().inject(options)
  expect(response.statusCode).toBe(expectedResponseCode)
  return response
}

// const addOnPreAuth = async sessionData => {
//   // Add session injection using on pre auth functionality.
//   // This shoud be done using a pre handler but only one pre handler can be registered
//   // with a Hapi.js server.
//   // Using on pre auth functionaliy is acceptable for testing purposes.
//   await getServer().register(onPreAuth(sessionData))
// }

module.exports = {
  submitGetRequest,
  submitPostRequest,
  submitPostRequestExpectHandledError,
  submitPostRequestExpectServiceError
}
