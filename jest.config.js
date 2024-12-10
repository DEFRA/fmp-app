const { setImmediate } = require('timers')

module.exports = async () => {
  return {
    testPathIgnorePatterns: [
      'defra-map'
    ],
    testEnvironment: 'jsdom',
    globals: {
      setImmediate
    }
  }
}
