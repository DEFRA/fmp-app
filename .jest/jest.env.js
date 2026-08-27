const { setImmediate } = require('timers')
const { TextDecoder, TextEncoder } = require('util')
global.setImmediate = setImmediate
global.TextDecoder = TextDecoder
global.TextEncoder = TextEncoder
process.env.fmpProxyUrl = process.env.fmpProxyUrl || 'http://localhost:3005'
