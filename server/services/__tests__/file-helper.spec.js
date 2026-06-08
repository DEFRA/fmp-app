const Busboy = require('busboy')
const { getFile, streamToBuffer } = require('../file-helper')

jest.mock('busboy')

let mockBusboy
let mockFile

beforeEach(() => {
  mockFile = {
    [Symbol.asyncIterator]: async function * () {
      yield Buffer.from('fake zip data')
    }
  }

  mockBusboy = {
    on: jest.fn()
  }

  Busboy.mockImplementation(() => mockBusboy)

  mockBusboy.on.mockImplementation((event, handler) => {
    if (event === 'file') {
      setImmediate(() => handler('boundary', mockFile, 'test.zip'))
    }
  })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('getFile', () => {
  it('should resolve with the file stream when a file is received', async () => {
    const result = await getFile({ raw: { req: { headers: {}, pipe: jest.fn() } } })
    expect(result).toBe(mockFile)
  })

  it('should pipe the request to busboy', async () => {
    const mockReq = { headers: {}, pipe: jest.fn() }
    await getFile({ raw: { req: mockReq } })
    expect(mockReq.pipe).toHaveBeenCalledWith(mockBusboy)
  })

  it('should reject if no file is received', async () => {
    mockBusboy.on.mockImplementation((event, handler) => {
      if (event === 'close') setImmediate(() => handler())
    })
    await expect(getFile({ raw: { req: { headers: {}, pipe: jest.fn() } } })).rejects.toThrow('Non file received')
  })

  it('should reject if busboy emits an error', async () => {
    mockBusboy.on.mockImplementation((event, handler) => {
      if (event === 'error') setImmediate(() => handler(new Error('Parse error')))
    })
    await expect(getFile({ raw: { req: { headers: {}, pipe: jest.fn() } } })).rejects.toThrow('Parse error')
  })

  it('should preserve the original error when busboy emits an error', async () => {
    const originalError = new Error('Parse error')
    mockBusboy.on.mockImplementation((event, handler) => {
      if (event === 'error') setImmediate(() => handler(originalError))
    })
    await expect(getFile({ raw: { req: { headers: {}, pipe: jest.fn() } } })).rejects.toBe(originalError)
  })
})

describe('streamToBuffer', () => {
  it('should convert a stream to a buffer', async () => {
    const result = await streamToBuffer(mockFile)
    expect(result).toEqual(Buffer.from('fake zip data'))
  })

  it('should handle a stream with multiple chunks', async () => {
    const multiChunkStream = {
      [Symbol.asyncIterator]: async function * () {
        yield Buffer.from('chunk one ')
        yield Buffer.from('chunk two')
      }
    }
    const result = await streamToBuffer(multiChunkStream)
    expect(result).toEqual(Buffer.from('chunk one chunk two'))
  })

  it('should return an empty buffer for an empty stream', async () => {
    const emptyStream = {
      [Symbol.asyncIterator]: async function * () { }
    }
    const result = await streamToBuffer(emptyStream)
    expect(result).toEqual(Buffer.alloc(0))
  })
})
