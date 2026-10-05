const mockValidateFileExtension = jest.fn()
const mockGetParserForFile = jest.fn()
const mockValidateGeoJSON = jest.fn()
const mockValidateNodeCount = jest.fn()
const mockIsValidBNG = jest.fn()
const mockShowError = jest.fn()
const mockParseShapefile = jest.fn()
const mockParseGeoJSON = jest.fn()
const mockParseGeopackage = jest.fn()
const mockEncodePolygon = jest.fn()

jest.mock('./upload-file-validators.js', () => ({
  validateFileExtension: (...args) => mockValidateFileExtension(...args),
  getParserForFile: (...args) => mockGetParserForFile(...args),
  validateGeoJSON: (...args) => mockValidateGeoJSON(...args),
  validateNodeCount: (...args) => mockValidateNodeCount(...args),
  isValidBNG: (...args) => mockIsValidBNG(...args)
}))

jest.mock('./upload-shape-file-dom.js', () => ({
  showError: (...args) => mockShowError(...args)
}))

jest.mock('./parsers/shapefile-parser.js', () => ({
  parseShapefile: (...args) => mockParseShapefile(...args)
}))

jest.mock('./parsers/geojson-parser.js', () => ({
  parseGeoJSON: (...args) => mockParseGeoJSON(...args)
}))

jest.mock('./parsers/geopackage-parser.js', () => ({
  parseGeopackage: (...args) => mockParseGeopackage(...args)
}))

jest.mock('../../../server/services/shape-utils.js', () => ({
  encodePolygon: (...args) => mockEncodePolygon(...args)
}))

const {
  noFileSelected,
  tooManyNodes,
  fileCouldNotBeRead,
  tooManyFilesSelected,
  invalidFileFormat,
  locationFormatError
} = require('./upload-file-errors.js')

describe('upload-file-client', () => {
  let uploadButton
  let fileInput

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    document.body.innerHTML = ''
    // jsdom does not implement navigation, so setting location.href always logs this
    jest.spyOn(console, 'error').mockImplementation((message) => {
      if (message?.type === 'not implemented') {
        return
      }
      console.warn(message)
    })

    uploadButton = document.createElement('button')
    uploadButton.id = 'upload'
    fileInput = document.createElement('input')
    fileInput.id = 'boundary-input'
    fileInput.type = 'file'
    document.body.appendChild(uploadButton)
    document.body.appendChild(fileInput)

    require('./upload-file-client.js')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const setSelectedFile = (name, contents = 'test') => {
    const file = new File([contents], name)
    file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8))
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: true,
      configurable: true
    })
  }

  const clickUpload = async () => {
    uploadButton.click()
    // allow the async click handler's promise chain to settle
    await new Promise((resolve) => setImmediate(resolve))
  }

  it('should show noFileSelected error when no file is selected', async () => {
    Object.defineProperty(fileInput, 'files', { value: [], writable: true, configurable: true })

    await clickUpload()

    expect(mockShowError).toHaveBeenCalledWith(noFileSelected)
  })

  it('should show invalidFileFormat error when the file extension is not supported', async () => {
    setSelectedFile('test.txt')
    mockValidateFileExtension.mockReturnValue(false)

    await clickUpload()

    expect(mockShowError).toHaveBeenCalledWith(invalidFileFormat)
  })

  it('should show tooManyFilesSelected error when the parser throws that error', async () => {
    setSelectedFile('test.zip')
    mockValidateFileExtension.mockReturnValue(true)
    mockGetParserForFile.mockReturnValue('shapefile')
    mockParseShapefile.mockRejectedValue(new Error(tooManyFilesSelected.summary))

    await clickUpload()

    expect(mockShowError).toHaveBeenCalledWith(tooManyFilesSelected)
  })

  it('should show fileCouldNotBeRead error when the parser throws that error', async () => {
    setSelectedFile('test.geojson')
    mockValidateFileExtension.mockReturnValue(true)
    mockGetParserForFile.mockReturnValue('geojson')
    mockParseGeoJSON.mockRejectedValue(new Error(fileCouldNotBeRead.summary))

    await clickUpload()

    expect(mockShowError).toHaveBeenCalledWith(fileCouldNotBeRead)
  })

  it('should show locationFormatError when the parser throws an unrecognised error', async () => {
    setSelectedFile('test.gpkg')
    mockValidateFileExtension.mockReturnValue(true)
    mockGetParserForFile.mockReturnValue('geopackage')
    mockParseGeopackage.mockRejectedValue(new Error('some other error'))

    await clickUpload()

    expect(mockShowError).toHaveBeenCalledWith(locationFormatError)
  })

  it('should show the geoJSON validation error when the geojson is invalid', async () => {
    setSelectedFile('test.geojson')
    mockValidateFileExtension.mockReturnValue(true)
    mockGetParserForFile.mockReturnValue('geojson')
    const geojson = { features: [] }
    mockParseGeoJSON.mockResolvedValue(geojson)
    mockValidateGeoJSON.mockReturnValue(locationFormatError)

    await clickUpload()

    expect(mockShowError).toHaveBeenCalledWith(locationFormatError)
    expect(mockValidateGeoJSON).toHaveBeenCalledWith(geojson)
  })

  it('should show tooManyNodes error when the polygon has too many nodes', async () => {
    setSelectedFile('test.geojson')
    mockValidateFileExtension.mockReturnValue(true)
    mockGetParserForFile.mockReturnValue('geojson')
    const polygon = [[0, 0], [1, 1]]
    const geojson = { features: [{ geometry: { coordinates: [polygon] } }] }
    mockParseGeoJSON.mockResolvedValue(geojson)
    mockValidateGeoJSON.mockReturnValue(null)
    mockValidateNodeCount.mockReturnValue(false)

    await clickUpload()

    expect(mockShowError).toHaveBeenCalledWith(tooManyNodes)
  })

  it('should show locationFormatError when the polygon is not valid BNG', async () => {
    setSelectedFile('test.geojson')
    mockValidateFileExtension.mockReturnValue(true)
    mockGetParserForFile.mockReturnValue('geojson')
    const polygon = [[0, 0], [1, 1]]
    const geojson = { features: [{ geometry: { coordinates: [polygon] } }] }
    mockParseGeoJSON.mockResolvedValue(geojson)
    mockValidateGeoJSON.mockReturnValue(null)
    mockValidateNodeCount.mockReturnValue(true)
    mockIsValidBNG.mockReturnValue(false)

    await clickUpload()

    expect(mockShowError).toHaveBeenCalledWith(locationFormatError)
  })

  it('should redirect to the map page with the encoded polygon on success', async () => {
    setSelectedFile('test.zip')
    mockValidateFileExtension.mockReturnValue(true)
    mockGetParserForFile.mockReturnValue('shapefile')
    const polygon = [[530000, 180000], [531000, 180000]]
    const geojson = { features: [{ geometry: { coordinates: [polygon] } }] }
    mockParseShapefile.mockResolvedValue(geojson)
    mockValidateGeoJSON.mockReturnValue(null)
    mockValidateNodeCount.mockReturnValue(true)
    mockIsValidBNG.mockReturnValue(true)
    mockEncodePolygon.mockReturnValue('encoded-polygon-value')

    await clickUpload()

    expect(mockEncodePolygon).toHaveBeenCalledWith(polygon)
    expect(mockShowError).not.toHaveBeenCalled()
  })

  it('should parse using the geopackage parser when that format is selected', async () => {
    setSelectedFile('test.gpkg')
    mockValidateFileExtension.mockReturnValue(true)
    mockGetParserForFile.mockReturnValue('geopackage')
    const polygon = [[530000, 180000], [531000, 180000]]
    const geojson = { features: [{ geometry: { coordinates: [polygon] } }] }
    mockParseGeopackage.mockResolvedValue(geojson)
    mockValidateGeoJSON.mockReturnValue(null)
    mockValidateNodeCount.mockReturnValue(true)
    mockIsValidBNG.mockReturnValue(true)
    mockEncodePolygon.mockReturnValue('encoded-polygon-value')

    await clickUpload()

    expect(mockParseGeopackage).toHaveBeenCalled()
    expect(mockEncodePolygon).toHaveBeenCalledWith(polygon)
    expect(mockShowError).not.toHaveBeenCalled()
  })
})
