const proj4 = require('proj4')

const WGS84 = '+proj=longlat +datum=WGS84 +no_defs'

const BNG =
  '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 ' +
  '+x_0=400000 +y_0=-100000 +ellps=airy ' +
  '+towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 ' +
  '+units=m +no_defs'

const TOLERANCE = 0.01 // metres

describe('Coordinate transformation tests', () => {
  it('BNG round-trip conversion accuracy', () => {
    const XMIN = 0
    const XMAX = 700000
    const YMIN = 0
    const YMAX = 1300000
    const STEP = 100000

    for (let x = XMIN; x <= XMAX; x += STEP) {
      for (let y = YMIN; y <= YMAX; y += STEP) {

        const latLong = proj4(BNG, WGS84, [x, y])
        const bng = proj4(WGS84, BNG, latLong)

        expect(Math.abs(bng[0] - x)).toBeLessThan(TOLERANCE)
        expect(Math.abs(bng[1] - y)).toBeLessThan(TOLERANCE)

      }
    }
  })
})