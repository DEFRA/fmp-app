module.exports = async () => {
  const config = {
    collectCoverage: true,
    coverageReporters: [
      'lcov',
      'text'
    ],
    testPathIgnorePatterns: [
      '/defra-map'
    ],
    testEnvironment: 'jsdom',
    globals: {
      setImmediate
    },
    setupFiles: ['<rootDir>/.jest/jest.env.js'],
    setupFilesAfterEnv: ['<rootDir>/.jest/setup.js']
  }
  return config
}
