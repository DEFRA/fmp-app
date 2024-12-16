module.exports = async () => {
  const config = {
    testPathIgnorePatterns: [
      '/defra-map'
    ],
    testEnvironment: 'jsdom',
    globals: {
      setImmediate
    },
    setupFilesAfterEnv: ['<rootDir>/jest.env.js']
  }
  return config
}
