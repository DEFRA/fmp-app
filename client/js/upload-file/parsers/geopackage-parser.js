import initSqlJs from 'sql.js'

// WKB (Well-Known Binary) constants
const WKB_BYTE_ORDER_SIZE = 1
const WKB_RING_COUNT_SIZE = 4
const WKB_POINT_SIZE = 16 // 2 Float64s (8 bytes each)
const WKB_FLOAT64_SIZE = 8
const WKB_POLYGON_TYPE = 3
const WKB_POLYGON_DATA_START = 5 // byte order (1) + geometry type (4)

// GeoPackage header constants
const GPKG_MAGIC_BYTE_1 = 0x47 // 'G'
const GPKG_MAGIC_BYTE_2 = 0x50 // 'P'
const GPKG_HEADER_SIZE = 8
const GPKG_FLAGS_BYTE_OFFSET = 3
const GPKG_ENVELOPE_TYPE_MASK = 0x0E
const GPKG_ENVELOPE_TYPE_SHIFT = 1
const GPKG_ENVELOPE_NO = 0
const GPKG_ENVELOPE_XY = 32
const GPKG_ENVELOPE_XYZ = 48
const GPKG_ENVELOPE_XYM = 48
const GPKG_ENVELOPE_XYZM = 64
const GPKG_ENVELOPE_SIZES = [GPKG_ENVELOPE_NO, GPKG_ENVELOPE_XY, GPKG_ENVELOPE_XYZ, GPKG_ENVELOPE_XYM, GPKG_ENVELOPE_XYZM]

// The offsets are used for WKB (Well-Known Binary) as it is a sequential binary format
const parseWKBPoint = (data, offset, littleEndian) => {
  const view = new DataView(data)
  const x = littleEndian ? view.getFloat64(offset, true) : view.getFloat64(offset, false)
  const y = littleEndian ? view.getFloat64(offset + WKB_FLOAT64_SIZE, true) : view.getFloat64(offset + WKB_FLOAT64_SIZE, false)
  return [x, y]
}

const parseWKBLinearRing = (data, offset, littleEndian) => {
  const view = new DataView(data)
  const numPoints = littleEndian ? view.getUint32(offset, true) : view.getUint32(offset, false)
  offset += WKB_RING_COUNT_SIZE
  const ring = []
  for (let i = 0; i < numPoints; i++) {
    ring.push(parseWKBPoint(data, offset, littleEndian))
    offset += WKB_POINT_SIZE
  }
  return ring
}

const parseWKBPolygon = (data, offset, littleEndian) => {
  const view = new DataView(data)
  const numRings = littleEndian ? view.getUint32(offset, true) : view.getUint32(offset, false)
  offset += WKB_RING_COUNT_SIZE
  const coordinates = []
  for (let i = 0; i < numRings; i++) {
    const ring = parseWKBLinearRing(data, offset, littleEndian)
    coordinates.push(ring)
    offset += WKB_RING_COUNT_SIZE + ring.length * WKB_POINT_SIZE
  }
  return coordinates
}

const parseWKB = (buffer) => {
  const view = new DataView(buffer)
  const littleEndian = view.getUint8(0) === 1
  const geometryType = littleEndian
    ? view.getUint32(WKB_BYTE_ORDER_SIZE, true)
    : view.getUint32(WKB_BYTE_ORDER_SIZE, false)

  if (geometryType === WKB_POLYGON_TYPE) {
    const coordinates = parseWKBPolygon(buffer, WKB_POLYGON_DATA_START, littleEndian)
    return {
      type: 'Polygon',
      coordinates
    }
  }

  throw new Error('Only Polygon geometries are supported')
}

const stripGeoPackageHeader = (data) => {
  // Convert to ArrayBuffer if needed
  let buffer = data
  if (Array.isArray(data) || !(data instanceof ArrayBuffer)) {
    buffer = new Uint8Array(data).buffer
  }

  const view = new DataView(buffer)

  // Check for GeoPackage magic bytes: 0x47 0x50 ('GP')
  if (view.byteLength >= 2 && view.getUint8(0) === GPKG_MAGIC_BYTE_1 && view.getUint8(1) === GPKG_MAGIC_BYTE_2) {
    // GeoPackage format: 2 bytes magic + 1 version + 1 flags + 4 SRS ID + optional envelope
    const flags = view.getUint8(GPKG_FLAGS_BYTE_OFFSET)
    const envelopeType = (flags & GPKG_ENVELOPE_TYPE_MASK) >> GPKG_ENVELOPE_TYPE_SHIFT

    const envelopeSize = GPKG_ENVELOPE_SIZES[envelopeType] || 0
    const headerSize = GPKG_HEADER_SIZE + envelopeSize
    return buffer.slice(headerSize)
  }

  // Not a GeoPackage header, assume it's standard WKB
  return buffer
}

const findFallbackTableAndGeometry = (db) => {
  const tableResult = db.exec("SELECT name FROM sqlite_master WHERE type='table'")
  if (!tableResult?.length) {
    throw new Error('No tables found in Geopackage')
  }

  const tables = tableResult[0].values.map(row => row[0])
  const nonSystemTables = tables.filter(t => !t.startsWith('sqlite_') && !t.startsWith('gpkg_'))

  if (!nonSystemTables.length) {
    throw new Error('No geometry tables found in Geopackage')
  }

  const tableName = nonSystemTables[0]
  const colResult = db.exec(`PRAGMA table_info("${tableName}")`)

  if (!colResult?.length) {
    throw new Error('Could not determine geometry column')
  }

  const colNames = colResult[0].values.map(row => row[1])
  const geometryColumn = colNames.find(name =>
    name.toLowerCase().includes('geometry') ||
    name.toLowerCase().includes('geom') ||
    name.toLowerCase().includes('shape')
  ) || colNames[colNames.length - 1]

  return { tableName, geometryColumn }
}

const parseGeopackage = async (buffer) => {
  let SQL
  try {
    SQL = await initSqlJs({
      locateFile: () => '/assets/sql-wasm.wasm'
    })
  } catch (err) {
    throw new Error(`Could not initialize SQLite parser: ${err.message}`)
  }

  try {
    const uint8array = new Uint8Array(buffer)
    const db = new SQL.Database(uint8array)

    const result = db.exec(`
      SELECT gc.table_name, gc.column_name
      FROM gpkg_geometry_columns gc
      JOIN gpkg_contents c ON gc.table_name = c.table_name
      WHERE c.data_type = 'features'
      LIMIT 1
    `)

    let tableName, geometryColumn
    if (result?.length) {
      const columns = result[0].columns
      const values = result[0].values[0]
      tableName = values[columns.indexOf('table_name')]
      geometryColumn = values[columns.indexOf('column_name')]
    } else {
      ({ tableName, geometryColumn } = findFallbackTableAndGeometry(db))
    }

    // Query geometry from table
    const geometryResult = db.exec(
      `SELECT "${geometryColumn}" FROM "${tableName}" LIMIT 1`
    )

    if (!geometryResult?.length) {
      throw new Error('Could not read geometry from Geopackage')
    }

    const wkbBuffer = geometryResult[0].values[0][0]
    if (!wkbBuffer) {
      throw new Error('The Geopackage\'s geometry column is empty')
    }

    // Strip GeoPackage header and convert to ArrayBuffer
    const wkbData = stripGeoPackageHeader(wkbBuffer)
    const geometry = parseWKB(wkbData)

    // Return as FeatureCollection
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry,
          properties: {}
        }
      ]
    }
  } catch (err) {
    throw new Error(`Could not parse Geopackage: ${err.message}`)
  }
}

export { parseGeopackage }
