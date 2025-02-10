const { mockPolygons } = require('./__mocks__/floodZoneByPolygonMock')
const {
  method: getFloodZoneByPolygon,
  options: { generateKey }
} = require('../../../server/services/floodZoneByPolygon')

describe('getFloodZoneByPolygon - Error Handling Scenarios', () => {
  it('getFloodZoneByPolygon without polygon should throw "No Polygon provided"', async () => {
    try {
      const response = await getFloodZoneByPolygon('')
      expect(response).toEqual('this line should not be reached')
    } catch (err) {
      expect(err.message).toEqual('getFloodZoneByPolygon - No Polygon provided')
    }
  })

  it('getFloodZoneByPolygon should throw if esriRequest throws"', async () => {
    try {
      await getFloodZoneByPolygon(mockPolygons.throws)
      expect('').toEqual('this line should not be reached')
    } catch (err) {
      console.log(err)
      expect(err.message).toEqual('Fetching getFloodZoneByPolygon failed: ')
    }
  })
})

describe('getFloodZoneByPolygon - Flood Zone Only Scenarios', () => {
  it('getFloodZoneByPolygon should return data as expected for FZ3 only', async () => {
    const response = await getFloodZoneByPolygon(mockPolygons.fz3_only)
    expect(response).toEqual({
      floodZone: '3',
      floodzone_2: false,
      floodzone_3: true,
      floodZoneLevel: 'high'
    })
  })

  it('getFloodZoneByPolygon should return data as expected for FZ2 only', async () => {
    const response = await getFloodZoneByPolygon(mockPolygons.fz2_only)
    expect(response).toEqual({
      floodZone: '2',
      floodzone_2: true,
      floodzone_3: false,
      floodZoneLevel: 'medium'
    })
  })

  it('getFloodZoneByPolygon should return data as expected for FZ2 and FZ3', async () => {
    const response = await getFloodZoneByPolygon(mockPolygons.fz2_and_3)
    expect(response).toEqual({
      floodZone: '3',
      floodzone_2: true,
      floodzone_3: true,
      floodZoneLevel: 'high'
    })
  })
})

describe('generateKey', () => {
  it('generateKey should stringify a polygon', async () => {
    expect(generateKey([123, 456])).toEqual('[123,456]')
  })
})
