const { setImmediate } = require('timers')
const { TextDecoder, TextEncoder } = require('util')
global.setImmediate = setImmediate
global.TextDecoder = TextDecoder
global.TextEncoder = TextEncoder
const { generateKeys } = require('@defra/fmp-utilities/secureUtils')
// A valid key is generated at run time so that no real key is committed to git
process.env.proxyPrivateKey = generateKeys().privateKey
process.env.fmpProxyUrl = process.env.fmpProxyUrl || 'http://localhost:3005'

// Mock fetch globally for tests
const fetchMock = () => Promise.resolve({
  json: () => Promise.resolve({ fmpProxyUrl: 'http://localhost:3005' }),
  text: () => Promise.resolve(''),
  ok: true,
  status: 200
})

global.fetch = fetchMock
if (typeof window !== 'undefined') {
  window.fetch = fetchMock
}
