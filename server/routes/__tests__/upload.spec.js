const constants = require('../../constants')
const {
  submitGetRequest,
  submitPostRequest,
  submitPostRequestExpectHandledError,
  submitPostRequestExpectServiceError
} = require('../../__test-helpers__/server')
const multiparty = require('multiparty')

jest.mock('multiparty')
jest.mock('../../services/zip-helper', () => ({
  extractProjectionFiles: jest.fn()
}))
jest.mock('shpjs', () => ({
  __esModule: true,
  default: jest.fn()
}), { virtual: true })

const shp = require('shpjs').default
const { extractProjectionFiles } = require('../../services/zip-helper')
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

const setupZipMocks = (geojson = validGeoJSON) => {
  extractProjectionFiles.mockResolvedValue(new ArrayBuffer(8))
  shp.mockResolvedValue(geojson)
}

describe('Upload route', () => {
  describe('GET', () => {
    it('should return the upload view', async () => {
      await submitGetRequest({ url }, 'Upload a boundary')
    })
  })

  describe('POST', () => {
    describe('file validation', () => {
      it('should return an error for an invalid file extension', async () => {
        mockPart.filename = 'test.txt'
        await submitPostRequestExpectHandledError(
          { url },
          'Only upload a GeoJSON file (.geojson), Geopackage (.gpkg) or Shape files (.zip)'
        )
      })

      it('should accept a .zip file and redirect', async () => {
        setupZipMocks()
        await submitPostRequest({ url })
      })

      it('should return a service error if a non-file part is received', async () => {
        mockForm.on.mockImplementation((event, handler) => {
          if (event === 'part') setImmediate(() => handler({ filename: null }))
        })
        await submitPostRequestExpectServiceError({ url })
      })
    })

    describe('GeoJSON validation', () => {
      it('should return an error if geojson is null', async () => {
        setupZipMocks(null)
        await submitPostRequestExpectHandledError(
          { url },
          'Only upload a GeoJSON with a single feature.'
        )
      })

      it('should return an error if geojson has no features', async () => {
        setupZipMocks({ features: [] })
        await submitPostRequestExpectHandledError(
          { url },
          'Only upload a GeoJSON with a single feature.'
        )
      })

      it('should return an error if geojson has multiple features', async () => {
        setupZipMocks({
          features: [
            { geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] } },
            { geometry: { type: 'Polygon', coordinates: [[[2, 2], [3, 2], [3, 3], [2, 2]]] } }
          ]
        })
        await submitPostRequestExpectHandledError(
          { url },
          'Only upload a GeoJSON with a single feature.'
        )
      })

      it('should return an error if the feature is not a Polygon', async () => {
        setupZipMocks({
          features: [{ geometry: { type: 'LineString', coordinates: [] } }]
        })
        await submitPostRequestExpectHandledError(
          { url },
          'Feature must be a single polygon.'
        )
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
      it('should return a service error if multiparty emits an error', async () => {
        mockForm.on.mockImplementation((event, handler) => {
          if (event === 'error') setImmediate(() => handler(new Error('Form parse error')))
        })
        await submitPostRequestExpectServiceError({ url })
      })

      it('should return a service error if extractProjectionFiles fails', async () => {
        extractProjectionFiles.mockRejectedValue(new Error('Invalid zip'))
        await submitPostRequestExpectServiceError({ url })
      })
    })
  })
})
