const constants = require('../../constants')
const {
  submitGetRequest,
  submitPostRequest,
  submitPostRequestExpectHandledError,
  submitPostRequestExpectServiceError
} = require('../../__test-helpers__/server')
const mockPart = { filename: 'test.zip' }
const shp = require('shpjs').default
const { extractProjectionFiles } = require('../../services/zip-helper')
const setupZipMocks = (geojson = validGeoJSON) => {
  extractProjectionFiles.mockResolvedValue(new ArrayBuffer(8))
  shp.mockResolvedValue(geojson)
}

jest.mock('../../services/zip-helper', () => ({
  extractProjectionFiles: jest.fn()
}))
jest.mock('shpjs', () => ({
  __esModule: true,
  default: jest.fn()
}), { virtual: true })
jest.mock('../../services/validate-uploaded-shape-file', () => ({
  validateShapeFile: jest.fn(),
  validateGeoJSON: jest.fn()
}))
jest.mock('../../services/file-helper', () => ({
  getFile: jest.fn(),
  streamToBuffer: jest.fn()
}))

const { getFile, streamToBuffer } = require('../../services/file-helper')
const { validateShapeFile, validateGeoJSON } = require('../../services/validate-uploaded-shape-file')

const url = constants.routes.UPLOAD

const validGeoJSON = {
  features: [
    {
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      }
    }
  ]
}

beforeEach(() => {
  getFile.mockResolvedValue(mockPart)
  streamToBuffer.mockResolvedValue(Buffer.from('fake zip data'))
  validateShapeFile.mockReturnValue([])
  validateGeoJSON.mockReturnValue([])
  setupZipMocks()
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('Upload route', () => {
  describe('GET', () => {
    it('should return the upload view', async () => {
      await submitGetRequest({ url }, 'Upload a boundary')
    })
  })

  describe('POST', () => {
    describe('file validation', () => {
      it('should return an error for an invalid file extension', async () => {
        validateShapeFile.mockReturnValue([{ text: 'Only upload a GeoJSON file (.geojson), Geopackage (.gpkg) or Shape files (.zip)', href: '#boundary' }])
        await submitPostRequestExpectHandledError(
          { url },
          'Only upload a GeoJSON file (.geojson), Geopackage (.gpkg) or Shape files (.zip)'
        )
      })

      describe('GeoJSON validation', () => {
        it('should return an error if geojson is invalid', async () => {
          validateGeoJSON.mockReturnValue([{ text: 'Only upload a GeoJSON with a single feature.', href: '#boundary' }])
          await submitPostRequestExpectHandledError(
            { url },
            'Only upload a GeoJSON with a single feature.'
          )
        })
      })
    })

    describe('successful upload', () => {
      it('should redirect to the map route with the polygon coordinates', async () => {
        setupZipMocks()
        const response = await submitPostRequest({ url })
        const expectedPolygon = JSON.stringify(
          validGeoJSON.features[0].geometry.coordinates[0]
        )
        expect(response.headers.location).toBe(`${constants.routes.MAP}?polygon=${expectedPolygon}`)
      })
    })

    describe('error handling', () => {
      it('should return a service error if getFile fails', async () => {
        getFile.mockRejectedValue(new Error('Form parse error'))
        await submitPostRequestExpectServiceError({ url })
      })
    })
  })
})
