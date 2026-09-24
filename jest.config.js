module.exports = async () => {
  const config = {
    workerIdleMemoryLimit: '512MB',
    collectCoverage: true,
    coverageThreshold: {
      global: {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: -10
      }
    },
    collectCoverageFrom: [
      'client/**/*.{js,jsx}',
      'config/**/*.{js,jsx}',
      'server/**/*.{js,jsx}',
      '*.{js,jsx}'
    ],
    coverageReporters: [
      'lcov',
      'text'
    ],
    testPathIgnorePatterns: [
      '<rootDir>/defra-map/',
      '/e2e/',
      '__mocks__',
      '__test-helpers__'
    ],
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '/coverage/',
      '/e2e/',
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
