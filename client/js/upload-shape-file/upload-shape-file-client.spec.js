const JSZip = require('jszip')
const {
  validateZipSignature,
  isValidBNG,
  validateFileExtension,
  validateFileSize,
  validateFileCount,
  validateFileNames,
  validateAllowedFileTypes,
  validateGeoJSON,
  validateNodeCount,
  maxZipBytesSize,
  maxNodes,
  maxFiles
} = require('./upload-shape-file-validators.js')
const { encodePolygon } = require('../../../server/services/shape-utils.js')

describe('validateFileExtension', () => {
  it('should return true for a .zip file', () => {
    expect(validateFileExtension('test.zip')).toBe(true)
  })

  it('should return false for a non .zip file', () => {
    expect(validateFileExtension('test.txt')).toBe(false)
  })

  it('should be case insensitive', () => {
    expect(validateFileExtension('test.ZIP')).toBe(true)
  })
})

describe('validateFileSize', () => {
  it('should return true for a file within the size limit', () => {
    expect(validateFileSize(maxZipBytesSize)).toBe(true)
  })

  it('should return false for a file exceeding the size limit', () => {
    expect(validateFileSize(maxZipBytesSize + 1)).toBe(false)
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
    expect(validateGeoJSON(null)).toBe('Only upload a shape file containing a single polygon.')
  })

  it('should return an error if geojson has multiple features', () => {
    const geojson = {
      features: [
        { geometry: { type: 'Polygon', coordinates: [] } },
        { geometry: { type: 'Polygon', coordinates: [] } }
      ]
    }
    expect(validateGeoJSON(geojson)).toBe('Only upload a shape file containing a single polygon.')
  })

  it('should return an error if the feature is not a Polygon', () => {
    const geojson = {
      features: [{ geometry: { type: 'LineString', coordinates: [] } }]
    }
    expect(validateGeoJSON(geojson)).toBe('The shape file must contain a polygon, not a point or line.')
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
  let errorMessage

  beforeEach(() => {
    jest.resetModules()
    errorSummary = document.createElement('div')
    errorSummary.id = 'errorSummary'
    errorSummary.style.display = 'none'
    errorMessage = document.createElement('div')
    errorMessage.id = 'errorMessage'
    document.body.appendChild(errorSummary)
    document.body.appendChild(errorMessage)
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should display the error message', () => {
    const { showError } = require('./upload-shape-file-dom.js')
    showError('Something went wrong.')
    expect(errorSummary.style.display).toBe('block')
    expect(errorMessage.textContent).toBe('Something went wrong.')
  })

  it('should clear the previous error before showing a new one', () => {
    const { showError } = require('./upload-shape-file-dom.js')
    showError('First error.')
    showError('Second error.')
    expect(errorMessage.textContent).toBe('Second error.')
  })

  it('should hide the error summary when cleared', () => {
    const { showError, clearError } = require('./upload-shape-file-dom.js')
    showError('An error.')
    clearError()
    expect(errorSummary.style.display).toBe('none')
    expect(errorMessage.textContent).toBe('')
  })
})
