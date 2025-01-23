const { makePointGeometry, makePolygonGeometry } = require('../')

describe('makePointGeometry', () => {
  it('should form a valid esriPointGeometry object', async () => {
    expect(makePointGeometry(17, 19)).toEqual({ x: 17, y: 19, spatialReference: { wkid: 27700 } })
  })
})

describe('makePolygonGeometry', () => {
  it('should form a valid esriPolygonGeometry object from an array', async () => {
    expect(makePolygonGeometry([[111, 111], [111, 112], [112, 112], [112, 111], [111, 111]]))
      .toEqual({
        rings: [[[111, 111], [111, 112], [112, 112], [112, 111], [111, 111]]],
        spatialReference: { wkid: 27700 }
      })
  })

  it('should form a valid esriPolygonGeometry object from an array in string form', async () => {
    expect(makePolygonGeometry('[[111, 111], [111, 112], [112, 112], [112, 111], [111, 111]]'))
      .toEqual({
        rings: [[[111, 111], [111, 112], [112, 112], [112, 111], [111, 111]]],
        spatialReference: { wkid: 27700 }
      })
  })
})
