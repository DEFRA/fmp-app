module.exports = async () => {
  const config = {
    collectCoverage: false,
    coverageReporters: [
      'lcov',
      'text'
    ],
    testPathIgnorePatterns: [
      '/defra-map',
      '__mocks__',
      '__test-helpers__'
    ],
    coveragePathIgnorePatterns: [
      '__test-helpers__'
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
