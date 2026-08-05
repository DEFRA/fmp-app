const JSZip = require('jszip')
const {
  validateZipSignature,
  isValidBNG,
  validateFileExtension,
  getParserForFile,
  validateFileCount,
  validateFileNames,
  validateAllowedFileTypes,
  validateGeoJSON,
  validateNodeCount,
  maxNodes,
  maxFiles
} = require('./upload-file-validators.js')
const {
  locationFormatError,
  noFileSelected,
  invalidFileFormat,
  tooManyNodes,
  tooManyFilesSelected,
  fileCouldNotBeRead
} = require('./upload-file-errors.js')
const { encodePolygon } = require('../../../server/services/shape-utils.js')

describe('validateFileExtension', () => {
  it('should return true for a .zip file', () => {
    expect(validateFileExtension('test.zip')).toBe(true)
  })

  it('should return true for a .geojson file', () => {
    expect(validateFileExtension('test.geojson')).toBe(true)
  })

  it('should return true for a .gpkg file', () => {
    expect(validateFileExtension('test.gpkg')).toBe(true)
  })

  it('should return false for a non-supported file', () => {
    expect(validateFileExtension('test.txt')).toBe(false)
  })

  it('should be case insensitive', () => {
    expect(validateFileExtension('test.ZIP')).toBe(true)
    expect(validateFileExtension('test.GEOJSON')).toBe(true)
    expect(validateFileExtension('test.GPKG')).toBe(true)
  })
})

describe('getParserForFile', () => {
  it('should return "shapefile" for .zip files', () => {
    expect(getParserForFile('test.zip')).toBe('shapefile')
  })

  it('should return "geojson" for .geojson files', () => {
    expect(getParserForFile('test.geojson')).toBe('geojson')
  })

  it('should return "geopackage" for .gpkg files', () => {
    expect(getParserForFile('test.gpkg')).toBe('geopackage')
  })

  it('should be case insensitive', () => {
    expect(getParserForFile('test.ZIP')).toBe('shapefile')
    expect(getParserForFile('test.GEOJSON')).toBe('geojson')
    expect(getParserForFile('test.GPKG')).toBe('geopackage')
  })

  it('should return null for unsupported file types', () => {
    expect(getParserForFile('test.txt')).toBeNull()
    expect(getParserForFile('test.shp')).toBeNull()
    expect(getParserForFile('test.json')).toBeNull()
  })
})

describe('validateZipSignature', () => {
  it('should return true for a valid zip signature', async () => {
    const zip = new JSZip()
    zip.file('test.shp', Buffer.from('test'))
    const buffer = await zip.generateAsync({ type: 'arraybuffer' })
    expect(validateZipSignature(buffer)).toBe(true)
  })

  it('should return false for an invalid zip signature', () => {
    const buffer = Buffer.from('this is not a zip file').buffer
    expect(validateZipSignature(buffer)).toBe(false)
  })
})

describe('validateFileCount', () => {
  it('should return true for a file count within the limit', () => {
    expect(validateFileCount(Array(maxFiles).fill('file.shp'))).toBe(true)
  })

  it('should return false for a file count exceeding the limit', () => {
    expect(validateFileCount(Array(maxFiles + 1).fill('file.shp'))).toBe(false)
  })
})

describe('validateFileNames', () => {
  it('should return true for safe file names', () => {
    expect(validateFileNames(['test.shp', 'test.shx'])).toBe(true)
  })

  it('should return false for a path traversal file name', () => {
    expect(validateFileNames(['../../etc/test.shp'])).toBe(false)
  })

  it('should return false for a file name starting with /', () => {
    expect(validateFileNames(['/etc/test.shp'])).toBe(false)
  })
})

describe('validateAllowedFileTypes', () => {
  it('should return true for allowed file types', () => {
    expect(validateAllowedFileTypes(['test.shp', 'test.shx', 'test.dbf'])).toBe(true)
  })

  it('should return false for disallowed file types', () => {
    expect(validateAllowedFileTypes(['test.shp', 'malicious.js'])).toBe(false)
  })
})

describe('validateGeoJSON', () => {
  it('should return null for valid GeoJSON', () => {
    const geojson = {
      features: [{ geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] } }]
    }
    expect(validateGeoJSON(geojson)).toBeNull()
  })

  it('should return an error if geojson is null', () => {
    expect(validateGeoJSON(null)).toBe(locationFormatError)
  })

  it('should return an error if geojson has multiple features', () => {
    const geojson = {
      features: [
        { geometry: { type: 'Polygon', coordinates: [] } },
        { geometry: { type: 'Polygon', coordinates: [] } }
      ]
    }
    expect(validateGeoJSON(geojson)).toBe(locationFormatError)
  })

  it('should return an error if the feature is not a Polygon', () => {
    const geojson = {
      features: [{ geometry: { type: 'LineString', coordinates: [] } }]
    }
    expect(validateGeoJSON(geojson)).toBe(locationFormatError)
  })
})

describe('validateNodeCount', () => {
  it('should return true for a polygon within the node limit', () => {
    const polygon = Array(maxNodes).fill([0, 0])
    expect(validateNodeCount(polygon)).toBe(true)
  })

  it('should return false for a polygon exceeding the node limit', () => {
    const polygon = Array(maxNodes + 1).fill([0, 0])
    expect(validateNodeCount(polygon)).toBe(false)
  })
})

describe('isValidBNG', () => {
  it('should return true for valid BNG coordinates', () => {
    expect(isValidBNG([[530000, 180000], [531000, 180000]])).toBe(true)
  })

  it('should return false for WGS84 coordinates', () => {
    expect(isValidBNG([[-0.1276, 51.5074], [-0.1376, 51.5074]])).toBe(false)
  })

  it('should return false for coordinates outside BNG range', () => {
    expect(isValidBNG([[700001, 180000]])).toBe(false)
    expect(isValidBNG([[530000, 1300001]])).toBe(false)
  })

  it('should return false for negative coordinates', () => {
    expect(isValidBNG([[-1, 180000]])).toBe(false)
  })
})

describe('encodePolygon', () => {
  it('should encode a polygon array to a polyline string', () => {
    const polygon = [[530000, 180000], [531000, 180000], [531000, 181000], [530000, 180000]]
    const encoded = encodePolygon(polygon)
    expect(typeof encoded).toBe('string')
    expect(encoded.length).toBeGreaterThan(0)
  })

  it('should encode a polygon passed as a JSON string', () => {
    const polygon = [[530000, 180000], [531000, 180000], [531000, 181000], [530000, 180000]]
    const encoded = encodePolygon(JSON.stringify(polygon))
    expect(typeof encoded).toBe('string')
    expect(encoded.length).toBeGreaterThan(0)
  })

  it('should produce consistent output for array and string input', () => {
    const polygon = [[530000, 180000], [531000, 180000], [531000, 181000], [530000, 180000]]
    const fromArray = encodePolygon(polygon)
    const fromString = encodePolygon(JSON.stringify(polygon))
    expect(fromArray).toBe(fromString)
  })
})

describe('showError and clearError', () => {
  let errorSummary
  let errorSummaryText
  let formGroup
  let fileInput

  beforeEach(() => {
    jest.resetModules()
    errorSummary = document.createElement('div')
    errorSummary.id = 'errorSummary'
    errorSummary.style.display = 'none'
    errorSummaryText = document.createElement('a')
    errorSummaryText.id = 'errorSummaryText'
    formGroup = document.createElement('div')
    formGroup.className = 'govuk-form-group'
    fileInput = document.createElement('input')
    fileInput.id = 'boundary'
    fileInput.type = 'file'
    const dropZone = document.createElement('div')
    dropZone.className = 'govuk-drop-zone'
    formGroup.appendChild(fileInput)
    formGroup.appendChild(dropZone)
    document.body.appendChild(errorSummary)
    document.body.appendChild(errorSummaryText)
    document.body.appendChild(formGroup)
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should display the error message', () => {
    const { showError } = require('./upload-shape-file-dom.js')
    showError('Something went wrong.')
    expect(errorSummary.style.display).toBe('block')
    expect(errorSummaryText.textContent).toBe('Something went wrong.')
    expect(document.getElementById('errorDetail').textContent).toContain('Something went wrong.')
  })

  it('should clear the previous error before showing a new one', () => {
    const { showError } = require('./upload-shape-file-dom.js')
    showError('First error.')
    showError('Second error.')
    expect(errorSummaryText.textContent).toBe('Second error.')
  })

  it('should hide the error summary and remove error state when cleared', () => {
    const { showError, clearError } = require('./upload-shape-file-dom.js')
    showError('An error.')
    clearError()
    expect(errorSummary.style.display).toBe('none')
    expect(errorSummaryText.textContent).toBe('')
    expect(document.getElementById('errorDetail')).toBeNull()
    expect(formGroup.classList.contains('govuk-form-group--error')).toBe(false)
  })

  it('should render location format error bullets when passed a structured message', () => {
    const { showError } = require('./upload-shape-file-dom.js')
    showError(locationFormatError)

    expect(errorSummaryText.textContent).toBe(locationFormatError.summary)
    const errorDetail = document.getElementById('errorDetail')
    const messageLines = errorDetail.querySelectorAll('span[style]')
    const bulletItems = errorDetail.querySelectorAll('ul.govuk-list--bullet li')
    expect(messageLines[0].textContent).toBe(`${locationFormatError.summary}.`)
    expect(messageLines[1].textContent).toBe('The file must:')
    expect(bulletItems.length).toBe(locationFormatError.bullets.length)
  })

  it('should render error with summary and text when passed a structured message without bullets', () => {
    const { showError } = require('./upload-shape-file-dom.js')
    showError(noFileSelected)

    expect(errorSummary.style.display).toBe('block')
    expect(errorSummaryText.textContent).toBe(noFileSelected.summary)
    const errorDetail = document.getElementById('errorDetail')
    expect(errorDetail).not.toBeNull()
    expect(errorDetail.textContent).toContain(noFileSelected.text)
    expect(errorDetail.querySelectorAll('ul').length).toBe(0)
    expect(formGroup.classList.contains('govuk-form-group--error')).toBe(true)
    expect(fileInput.classList.contains('govuk-file-upload--error')).toBe(true)
  })

  it('should render invalidFileFormat error with summary and text', () => {
    const { showError } = require('./upload-shape-file-dom.js')
    showError(invalidFileFormat)

    expect(errorSummary.style.display).toBe('block')
    expect(errorSummaryText.textContent).toBe(invalidFileFormat.summary)
    const errorDetail = document.getElementById('errorDetail')
    expect(errorDetail).not.toBeNull()
    expect(errorDetail.textContent).toContain(invalidFileFormat.text)
    expect(errorDetail.querySelectorAll('ul').length).toBe(0)
    expect(formGroup.classList.contains('govuk-form-group--error')).toBe(true)
    expect(fileInput.classList.contains('govuk-file-upload--error')).toBe(true)
  })

  it('should render tooManyNodes error', () => {
    const { showError } = require('./upload-shape-file-dom.js')
    showError(tooManyNodes)

    expect(errorSummaryText.textContent).toBe(tooManyNodes.summary)
    const errorDetail = document.getElementById('errorDetail')
    expect(errorDetail.textContent).toContain(tooManyNodes.text)
  })

  it('should render tooManyFilesSelected error', () => {
    const { showError } = require('./upload-shape-file-dom.js')
    showError(tooManyFilesSelected)

    expect(errorSummaryText.textContent).toBe(tooManyFilesSelected.summary)
    const errorDetail = document.getElementById('errorDetail')
    expect(errorDetail.textContent).toContain(tooManyFilesSelected.text)
  })

  it('should render fileCouldNotBeRead error', () => {
    const { showError } = require('./upload-shape-file-dom.js')
    showError(fileCouldNotBeRead)

    expect(errorSummaryText.textContent).toBe(fileCouldNotBeRead.summary)
    const errorDetail = document.getElementById('errorDetail')
    expect(errorDetail.textContent).toContain(fileCouldNotBeRead.text)
  })

  it('should reuse existing errorDetail element when called multiple times', () => {
    const { getOrCreateErrorDetail } = require('./upload-shape-file-dom.js')

    // First call creates the element
    const errorDetail1 = getOrCreateErrorDetail()
    expect(errorDetail1).not.toBeNull()
    expect(errorDetail1.id).toBe('errorDetail')

    // Second call should return the same element (not create a duplicate)
    const errorDetail2 = getOrCreateErrorDetail()
    expect(errorDetail2).toBe(errorDetail1)

    // Verify only one errorDetail element exists in the DOM
    const allErrorDetails = document.querySelectorAll('#errorDetail')
    expect(allErrorDetails.length).toBe(1)
  })
})
