const JSZip = require('jszip')
const { extractProjectionFiles } = require('../zip-helper')

jest.mock('jszip')

const mockBuffer = Buffer.from('fake zip data')
const mockArrayBuffer = new ArrayBuffer(8)

let mockZip

beforeEach(() => {
  mockZip = {
    files: {
      'shape.shp': {},
      'shape.prj': {},
      'shape.PRJ': {}
    },
    remove: jest.fn(),
    generateAsync: jest.fn().mockResolvedValue(mockArrayBuffer)
  }
  JSZip.loadAsync = jest.fn().mockResolvedValue(mockZip)
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('extractProjectionFiles', () => {
  it('should load the buffer as a zip', async () => {
    await extractProjectionFiles(mockBuffer)
    expect(JSZip.loadAsync).toHaveBeenCalledWith(mockBuffer)
  })

  it('should remove .prj files from the zip', async () => {
    await extractProjectionFiles(mockBuffer)
    expect(mockZip.remove).toHaveBeenCalledWith('shape.prj')
  })

  it('should remove .prj files with uppercase extension', async () => {
    await extractProjectionFiles(mockBuffer)
    expect(mockZip.remove).toHaveBeenCalledWith('shape.PRJ')
  })

  it('should not remove non .prj files', async () => {
    await extractProjectionFiles(mockBuffer)
    expect(mockZip.remove).not.toHaveBeenCalledWith('shape.shp')
  })

  it('should not call remove if there are no .prj files', async () => {
    mockZip.files = { 'shape.shp': {} }
    await extractProjectionFiles(mockBuffer)
    expect(mockZip.remove).not.toHaveBeenCalled()
  })

  it('should return the result of generateAsync', async () => {
    const result = await extractProjectionFiles(mockBuffer)
    expect(mockZip.generateAsync).toHaveBeenCalledWith({ type: 'arraybuffer' })
    expect(result).toBe(mockArrayBuffer)
  })

  it('should throw if JSZip fails to load the buffer', async () => {
    JSZip.loadAsync = jest.fn().mockRejectedValue(new Error('Invalid zip'))
    await expect(extractProjectionFiles(mockBuffer)).rejects.toThrow('Invalid zip')
  })
})
