const path = require('path')
const fs = require('fs')

const mockDotenvConfig = jest.fn()
jest.mock('dotenv', () => ({ config: mockDotenvConfig }))

const envPath = path.resolve(__dirname, '..', '..', '.env')
const examplePath = path.resolve(__dirname, '..', '.env-example')

const originalExistsSync = fs.existsSync

describe('environment.js', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.mock('dotenv', () => ({ config: mockDotenvConfig }))
    mockDotenvConfig.mockClear()
  })
  afterEach(() => {
    fs.existsSync = originalExistsSync
  })

  it('loads .env when the file exists', () => {
    fs.existsSync = (filePath) =>
      filePath === envPath ? true : originalExistsSync(filePath)
    jest.requireActual('../environment')
    expect(mockDotenvConfig).toHaveBeenCalledWith({ path: envPath })
  })

  it('loads .env-example as a fallback when .env is missing', () => {
    fs.existsSync = (filePath) =>
      filePath === envPath ? false : originalExistsSync(filePath)
    jest.requireActual('../environment')
    expect(mockDotenvConfig).toHaveBeenCalledWith({ path: examplePath })
  })
})
