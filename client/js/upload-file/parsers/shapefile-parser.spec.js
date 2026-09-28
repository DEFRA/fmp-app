const JSZip = require('jszip')

const mockShp = jest.fn()
jest.mock('shpjs', () => ({
  __esModule: true,
  default: (...args) => mockShp(...args)
}))

const { parseShapefile } = require('./shapefile-parser.js')
const {
  locationFormatError,
  fileCouldNotBeRead,
  tooManyFilesSelected
} = require('../upload-file-errors.js')
const { maxFiles } = require('../upload-file-validators.js')

describe('parseShapefile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should throw locationFormatError when the buffer is not a zip file', async () => {
    const buffer = Buffer.from('this is not a zip file').buffer

    await expect(parseShapefile(buffer)).rejects.toThrow(locationFormatError.summary)
  })

  it('should throw fileCouldNotBeRead when the zip cannot be parsed', async () => {
    // Valid PK zip signature but corrupt contents
    const buffer = new Uint8Array([0x50, 0x4b, 0x00, 0x00, 0x01, 0x02, 0x03]).buffer

    await expect(parseShapefile(buffer)).rejects.toThrow(fileCouldNotBeRead.summary)
  })

  it('should throw tooManyFilesSelected when the zip contains more than the allowed number of files', async () => {
    const zip = new JSZip()
    for (let i = 0; i < maxFiles + 1; i++) {
      zip.file(`file${i}.shp`, Buffer.from('data'))
    }
    const buffer = await zip.generateAsync({ type: 'arraybuffer' })

    await expect(parseShapefile(buffer)).rejects.toThrow(tooManyFilesSelected.summary)
  })

  it('should throw locationFormatError when a file name is unsafe', async () => {
    // JSZip sanitises '..' out of real zip archives, so stub loadAsync to
    // simulate an unsafe entry name reaching the validator.
    jest.spyOn(JSZip, 'loadAsync').mockResolvedValueOnce({
      files: { '../evil.shp': { dir: false } }
    })
    const buffer = new Uint8Array([0x50, 0x4b, 0x00, 0x00]).buffer

    await expect(parseShapefile(buffer)).rejects.toThrow(locationFormatError.summary)
  })

  it('should throw locationFormatError when a disallowed file type is present', async () => {
    const zip = new JSZip()
    zip.file('test.shp', Buffer.from('data'))
    zip.file('malicious.js', Buffer.from('data'))
    const buffer = await zip.generateAsync({ type: 'arraybuffer' })

    await expect(parseShapefile(buffer)).rejects.toThrow(locationFormatError.summary)
  })

  it('should strip .prj files and return the parsed geojson on success', async () => {
    const zip = new JSZip()
    zip.file('test.shp', Buffer.from('data'))
    zip.file('test.prj', Buffer.from('projection'))
    const buffer = await zip.generateAsync({ type: 'arraybuffer' })

    const geojson = { type: 'FeatureCollection', features: [] }
    mockShp.mockResolvedValue(geojson)

    const result = await parseShapefile(buffer)

    expect(result).toBe(geojson)
    expect(mockShp).toHaveBeenCalledTimes(1)
    const modifiedBuffer = mockShp.mock.calls[0][0]
    const modifiedZip = await JSZip.loadAsync(modifiedBuffer)
    expect(Object.keys(modifiedZip.files)).not.toContain('test.prj')
  })

  it('should throw fileCouldNotBeRead when shp() fails to parse the shapefile', async () => {
    const zip = new JSZip()
    zip.file('test.shp', Buffer.from('data'))
    const buffer = await zip.generateAsync({ type: 'arraybuffer' })

    mockShp.mockRejectedValue(new Error('bad shapefile'))

    await expect(parseShapefile(buffer)).rejects.toThrow(fileCouldNotBeRead.summary)
  })
})
