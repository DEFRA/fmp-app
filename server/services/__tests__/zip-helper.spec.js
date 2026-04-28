const JSZip = require('jszip')
const { extractProjectionFiles } = require('../zip-helper')

jest.mock('jszip')

const mockBuffer = Buffer.from('fake zip data')
const mockArrayBuffer = new ArrayBuffer(8)

let mockZip

beforeEach(() => {
  mockZip = {
    files: {
      'shape.shp': { dir: false, _data: { uncompressedSize: 10 } },
      'shape.prj': { dir: false, _data: { uncompressedSize: 10 } },
      'shape.PRJ': { dir: false, _data: { uncompressedSize: 10 } }
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
    mockZip.files = { 'shape.shp': { dir: false, _data: { uncompressedSize: 10 } } }
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

  it('should throw if the zip contains too many files', async () => {
    mockZip.files = Object.fromEntries(
      Array.from({ length: 11 }, (_, i) => [`file${i}.shp`, { dir: false, _data: { uncompressedSize: 1000 } }])
    )
    await expect(extractProjectionFiles(mockBuffer)).rejects.toThrow('too many files')
  })

  it('should throw if a file exceeds the maximum size', async () => {
    mockZip.files = {
      'shape.shp': { dir: false, _data: { uncompressedSize: 51 * 1024 * 1024 } }
    }
    await expect(extractProjectionFiles(mockBuffer)).rejects.toThrow('exceeds the maximum allowed size')
  })

  it('should not throw for a zip with valid file count and sizes', async () => {
    mockZip.files = {
      'shape.shp': { dir: false, _data: { uncompressedSize: 1000 } }
    }
    await expect(extractProjectionFiles(mockBuffer)).resolves.not.toThrow()
  })
})
