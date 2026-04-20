const multiparty = require('multiparty')
const { getFile, streamToBuffer } = require('../file-helper')

jest.mock('multiparty')

let mockForm
let mockPart

beforeEach(() => {
  mockPart = {
    filename: 'test.zip',
    [Symbol.asyncIterator]: async function * () {
      yield Buffer.from('fake zip data')
    }
  }

  mockForm = {
    on: jest.fn(),
    parse: jest.fn()
  }

  multiparty.Form.mockImplementation(() => mockForm)

  mockForm.on.mockImplementation((event, handler) => {
    if (event === 'part') {
      setImmediate(() => handler(mockPart))
    }
  })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('getFile', () => {
  it('should resolve with the file part when a file is received', async () => {
    const result = await getFile({ raw: { req: {} } })
    expect(result).toBe(mockPart)
  })

  it('should call form.parse with the raw request', async () => {
    const mockRawReq = {}
    await getFile({ raw: { req: mockRawReq } })
    expect(mockForm.parse).toHaveBeenCalledWith(mockRawReq)
  })

  it('should reject if a non-file part is received', async () => {
    mockForm.on.mockImplementation((event, handler) => {
      if (event === 'part') setImmediate(() => handler({ filename: null }))
    })
    await expect(getFile({ raw: { req: {} } })).rejects.toThrow('Non file received')
  })

  it('should reject if multiparty emits an error', async () => {
    mockForm.on.mockImplementation((event, handler) => {
      if (event === 'error') setImmediate(() => handler(new Error('Form parse error')))
    })
    await expect(getFile({ raw: { req: {} } })).rejects.toThrow('Form parse error')
  })

  it('should preserve the original error when multiparty emits an error', async () => {
    const originalError = new Error('Form parse error')
    mockForm.on.mockImplementation((event, handler) => {
      if (event === 'error') setImmediate(() => handler(originalError))
    })
    await expect(getFile({ raw: { req: {} } })).rejects.toBe(originalError)
  })
})

describe('streamToBuffer', () => {
  it('should convert a stream to a buffer', async () => {
    const result = await streamToBuffer(mockPart)
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
