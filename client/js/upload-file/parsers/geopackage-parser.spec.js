const mockInitSqlJs = jest.fn()
jest.mock('sql.js', () => ({
  __esModule: true,
  default: (...args) => mockInitSqlJs(...args)
}))

const { parseGeopackage } = require('./geopackage-parser.js')
const { fileCouldNotBeRead, locationFormatError } = require('../upload-file-errors.js')

// Builds a GeoPackage WKB blob: an 8 byte GeoPackage header (no envelope)
// followed by a WKB polygon with a single ring of the given points.
const buildGeoPackagePolygonBlob = (points) => {
  const pointsBytes = points.length * 16
  const totalSize = 8 + 1 + 4 + 4 + 4 + pointsBytes
  const buffer = new ArrayBuffer(totalSize)
  const view = new DataView(buffer)

  view.setUint8(0, 0x47) // 'G'
  view.setUint8(1, 0x50) // 'P'
  view.setUint8(2, 0) // version
  view.setUint8(3, 0) // flags: no envelope
  view.setUint32(4, 0, true) // srs id

  let offset = 8
  view.setUint8(offset, 1) // little endian
  offset += 1
  view.setUint32(offset, 3, true) // geometry type: Polygon
  offset += 4
  view.setUint32(offset, 1, true) // number of rings
  offset += 4
  view.setUint32(offset, points.length, true) // number of points in ring
  offset += 4
  points.forEach(([x, y]) => {
    view.setFloat64(offset, x, true)
    offset += 8
    view.setFloat64(offset, y, true)
    offset += 8
  })

  return new Uint8Array(buffer)
}

const buildNonPolygonWkbBlob = () => {
  const buffer = new ArrayBuffer(8 + 5)
  const view = new DataView(buffer)
  view.setUint8(0, 0x47)
  view.setUint8(1, 0x50)
  view.setUint8(2, 0)
  view.setUint8(3, 0)
  view.setUint32(4, 0, true)
  view.setUint8(8, 1)
  view.setUint32(9, 1, true) // geometry type: Point (not Polygon)
  return new Uint8Array(buffer)
}

// A raw WKB polygon with no surrounding GeoPackage header
const buildRawWkbPolygonBlob = (points, littleEndian = true) => {
  const pointsBytes = points.length * 16
  const totalSize = 1 + 4 + 4 + 4 + pointsBytes
  const buffer = new ArrayBuffer(totalSize)
  const view = new DataView(buffer)

  let offset = 0
  view.setUint8(offset, littleEndian ? 1 : 0)
  offset += 1
  view.setUint32(offset, 3, littleEndian) // geometry type: Polygon
  offset += 4
  view.setUint32(offset, 1, littleEndian) // number of rings
  offset += 4
  view.setUint32(offset, points.length, littleEndian) // number of points in ring
  offset += 4
  points.forEach(([x, y]) => {
    view.setFloat64(offset, x, littleEndian)
    offset += 8
    view.setFloat64(offset, y, littleEndian)
    offset += 8
  })

  return new Uint8Array(buffer)
}

describe('parseGeopackage', () => {
  const polygonPoints = [[530000, 180000], [531000, 180000], [531000, 181000]]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should throw fileCouldNotBeRead when sql.js fails to initialise', async () => {
    mockInitSqlJs.mockRejectedValue(new Error('wasm load failure'))

    await expect(parseGeopackage(new ArrayBuffer(8))).rejects.toThrow(fileCouldNotBeRead.summary)
  })

  it('should return the parsed polygon using gpkg_geometry_columns metadata', async () => {
    const wkbBlob = buildGeoPackagePolygonBlob(polygonPoints)
    const exec = jest.fn((sql) => {
      if (sql.includes('gpkg_geometry_columns')) {
        return [{ columns: ['table_name', 'column_name'], values: [['features', 'geom']] }]
      }
      if (sql.startsWith('SELECT "geom" FROM "features"')) {
        return [{ values: [[wkbBlob]] }]
      }
      throw new Error(`unexpected query: ${sql}`)
    })
    mockInitSqlJs.mockResolvedValue({ Database: jest.fn().mockImplementation(() => ({ exec })) })

    const result = await parseGeopackage(new ArrayBuffer(8))

    expect(result).toEqual({
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [polygonPoints] },
        properties: {}
      }]
    })
  })

  it('should fall back to inspecting the schema when there is no geometry columns metadata', async () => {
    const wkbBlob = buildGeoPackagePolygonBlob(polygonPoints)
    const exec = jest.fn((sql) => {
      if (sql.includes('gpkg_geometry_columns')) {
        return []
      }
      if (sql.includes('sqlite_master')) {
        return [{ values: [['my_table']] }]
      }
      if (sql.includes('PRAGMA table_info')) {
        return [{ values: [[0, 'id'], [1, 'geom']] }]
      }
      if (sql.startsWith('SELECT "geom" FROM "my_table"')) {
        return [{ values: [[wkbBlob]] }]
      }
      throw new Error(`unexpected query: ${sql}`)
    })
    mockInitSqlJs.mockResolvedValue({ Database: jest.fn().mockImplementation(() => ({ exec })) })

    const result = await parseGeopackage(new ArrayBuffer(8))

    expect(result.features[0].geometry.coordinates).toEqual([polygonPoints])
  })

  it('should throw fileCouldNotBeRead when no tables are found during fallback', async () => {
    const exec = jest.fn((sql) => {
      if (sql.includes('gpkg_geometry_columns')) {
        return []
      }
      if (sql.includes('sqlite_master')) {
        return []
      }
      throw new Error(`unexpected query: ${sql}`)
    })
    mockInitSqlJs.mockResolvedValue({ Database: jest.fn().mockImplementation(() => ({ exec })) })

    await expect(parseGeopackage(new ArrayBuffer(8))).rejects.toThrow(fileCouldNotBeRead.summary)
  })

  it('should throw fileCouldNotBeRead when no geometry can be found for the table', async () => {
    const exec = jest.fn((sql) => {
      if (sql.includes('gpkg_geometry_columns')) {
        return [{ columns: ['table_name', 'column_name'], values: [['features', 'geom']] }]
      }
      if (sql.startsWith('SELECT "geom" FROM "features"')) {
        return []
      }
      throw new Error(`unexpected query: ${sql}`)
    })
    mockInitSqlJs.mockResolvedValue({ Database: jest.fn().mockImplementation(() => ({ exec })) })

    await expect(parseGeopackage(new ArrayBuffer(8))).rejects.toThrow(fileCouldNotBeRead.summary)
  })

  it('should throw fileCouldNotBeRead when the geometry value is empty', async () => {
    const exec = jest.fn((sql) => {
      if (sql.includes('gpkg_geometry_columns')) {
        return [{ columns: ['table_name', 'column_name'], values: [['features', 'geom']] }]
      }
      if (sql.startsWith('SELECT "geom" FROM "features"')) {
        return [{ values: [[null]] }]
      }
      throw new Error(`unexpected query: ${sql}`)
    })
    mockInitSqlJs.mockResolvedValue({ Database: jest.fn().mockImplementation(() => ({ exec })) })

    await expect(parseGeopackage(new ArrayBuffer(8))).rejects.toThrow(fileCouldNotBeRead.summary)
  })

  it('should throw locationFormatError when the geometry is not a polygon', async () => {
    const wkbBlob = buildNonPolygonWkbBlob()
    const exec = jest.fn((sql) => {
      if (sql.includes('gpkg_geometry_columns')) {
        return [{ columns: ['table_name', 'column_name'], values: [['features', 'geom']] }]
      }
      if (sql.startsWith('SELECT "geom" FROM "features"')) {
        return [{ values: [[wkbBlob]] }]
      }
      throw new Error(`unexpected query: ${sql}`)
    })
    mockInitSqlJs.mockResolvedValue({ Database: jest.fn().mockImplementation(() => ({ exec })) })

    await expect(parseGeopackage(new ArrayBuffer(8))).rejects.toThrow(locationFormatError.summary)
  })

  it('should wrap unexpected errors as fileCouldNotBeRead', async () => {
    const exec = jest.fn(() => {
      throw new Error('unexpected database error')
    })
    mockInitSqlJs.mockResolvedValue({ Database: jest.fn().mockImplementation(() => ({ exec })) })

    await expect(parseGeopackage(new ArrayBuffer(8))).rejects.toThrow(fileCouldNotBeRead.summary)
  })

  it('should parse a geometry blob with no GeoPackage header as raw WKB', async () => {
    const wkbBlob = buildRawWkbPolygonBlob(polygonPoints)
    const exec = jest.fn((sql) => {
      if (sql.includes('gpkg_geometry_columns')) {
        return [{ columns: ['table_name', 'column_name'], values: [['features', 'geom']] }]
      }
      if (sql.startsWith('SELECT "geom" FROM "features"')) {
        return [{ values: [[wkbBlob]] }]
      }
      throw new Error(`unexpected query: ${sql}`)
    })
    mockInitSqlJs.mockResolvedValue({ Database: jest.fn().mockImplementation(() => ({ exec })) })

    const result = await parseGeopackage(new ArrayBuffer(8))

    expect(result.features[0].geometry.coordinates).toEqual([polygonPoints])
  })

  it('should throw fileCouldNotBeRead when the fallback schema only contains system tables', async () => {
    const exec = jest.fn((sql) => {
      if (sql.includes('gpkg_geometry_columns')) {
        return []
      }
      if (sql.includes('sqlite_master')) {
        return [{ values: [['sqlite_sequence'], ['gpkg_contents']] }]
      }
      throw new Error(`unexpected query: ${sql}`)
    })
    mockInitSqlJs.mockResolvedValue({ Database: jest.fn().mockImplementation(() => ({ exec })) })

    await expect(parseGeopackage(new ArrayBuffer(8))).rejects.toThrow(fileCouldNotBeRead.summary)
  })

  it('should throw fileCouldNotBeRead when the fallback table has no columns', async () => {
    const exec = jest.fn((sql) => {
      if (sql.includes('gpkg_geometry_columns')) {
        return []
      }
      if (sql.includes('sqlite_master')) {
        return [{ values: [['my_table']] }]
      }
      if (sql.includes('PRAGMA table_info')) {
        return []
      }
      throw new Error(`unexpected query: ${sql}`)
    })
    mockInitSqlJs.mockResolvedValue({ Database: jest.fn().mockImplementation(() => ({ exec })) })

    await expect(parseGeopackage(new ArrayBuffer(8))).rejects.toThrow(fileCouldNotBeRead.summary)
  })

  it('should pass a locateFile function to initSqlJs that resolves the wasm asset path', async () => {
    const wkbBlob = buildGeoPackagePolygonBlob(polygonPoints)
    const exec = jest.fn((sql) => {
      if (sql.includes('gpkg_geometry_columns')) {
        return [{ columns: ['table_name', 'column_name'], values: [['features', 'geom']] }]
      }
      if (sql.startsWith('SELECT "geom" FROM "features"')) {
        return [{ values: [[wkbBlob]] }]
      }
      throw new Error(`unexpected query: ${sql}`)
    })
    mockInitSqlJs.mockResolvedValue({ Database: jest.fn().mockImplementation(() => ({ exec })) })

    await parseGeopackage(new ArrayBuffer(8))

    const config = mockInitSqlJs.mock.calls[0][0]
    expect(config.locateFile()).toBe('/assets/sql-wasm.wasm')
  })

  it('should parse big-endian WKB geometries', async () => {
    const wkbBlob = buildRawWkbPolygonBlob(polygonPoints, false)
    const exec = jest.fn((sql) => {
      if (sql.includes('gpkg_geometry_columns')) {
        return [{ columns: ['table_name', 'column_name'], values: [['features', 'geom']] }]
      }
      if (sql.startsWith('SELECT "geom" FROM "features"')) {
        return [{ values: [[wkbBlob]] }]
      }
      throw new Error(`unexpected query: ${sql}`)
    })
    mockInitSqlJs.mockResolvedValue({ Database: jest.fn().mockImplementation(() => ({ exec })) })

    const result = await parseGeopackage(new ArrayBuffer(8))

    expect(result.features[0].geometry.coordinates).toEqual([polygonPoints])
  })

  it('should accept a plain array as the geometry blob', async () => {
    const wkbBlob = Array.from(buildRawWkbPolygonBlob(polygonPoints))
    const exec = jest.fn((sql) => {
      if (sql.includes('gpkg_geometry_columns')) {
        return [{ columns: ['table_name', 'column_name'], values: [['features', 'geom']] }]
      }
      if (sql.startsWith('SELECT "geom" FROM "features"')) {
        return [{ values: [[wkbBlob]] }]
      }
      throw new Error(`unexpected query: ${sql}`)
    })
    mockInitSqlJs.mockResolvedValue({ Database: jest.fn().mockImplementation(() => ({ exec })) })

    const result = await parseGeopackage(new ArrayBuffer(8))

    expect(result.features[0].geometry.coordinates).toEqual([polygonPoints])
  })

  it('should accept an ArrayBuffer directly as the geometry blob', async () => {
    const wkbBlob = buildRawWkbPolygonBlob(polygonPoints).buffer
    const exec = jest.fn((sql) => {
      if (sql.includes('gpkg_geometry_columns')) {
        return [{ columns: ['table_name', 'column_name'], values: [['features', 'geom']] }]
      }
      if (sql.startsWith('SELECT "geom" FROM "features"')) {
        return [{ values: [[wkbBlob]] }]
      }
      throw new Error(`unexpected query: ${sql}`)
    })
    mockInitSqlJs.mockResolvedValue({ Database: jest.fn().mockImplementation(() => ({ exec })) })

    const result = await parseGeopackage(new ArrayBuffer(8))

    expect(result.features[0].geometry.coordinates).toEqual([polygonPoints])
  })

  it('should fall back to the last column when no column name looks like a geometry column', async () => {
    const wkbBlob = buildGeoPackagePolygonBlob(polygonPoints)
    const exec = jest.fn((sql) => {
      if (sql.includes('gpkg_geometry_columns')) {
        return []
      }
      if (sql.includes('sqlite_master')) {
        return [{ values: [['my_table']] }]
      }
      if (sql.includes('PRAGMA table_info')) {
        return [{ values: [[0, 'id'], [1, 'blob_column']] }]
      }
      if (sql.startsWith('SELECT "blob_column" FROM "my_table"')) {
        return [{ values: [[wkbBlob]] }]
      }
      throw new Error(`unexpected query: ${sql}`)
    })
    mockInitSqlJs.mockResolvedValue({ Database: jest.fn().mockImplementation(() => ({ exec })) })

    const result = await parseGeopackage(new ArrayBuffer(8))

    expect(result.features[0].geometry.coordinates).toEqual([polygonPoints])
  })
})
