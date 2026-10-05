const { setImmediate } = require('timers')
const { TextDecoder, TextEncoder } = require('util')
global.setImmediate = setImmediate
global.TextDecoder = TextDecoder
global.TextEncoder = TextEncoder
