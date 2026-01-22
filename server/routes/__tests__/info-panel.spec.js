const { submitGetRequest } = require('../../__test-helpers__/server')

const infoPanelUrl = '/defra-map/info-panel'

describe('info-panel', () => {
  // beforeEach(async () => {
  // })

  describe('Flood Zones', () => {
    const tests = [
      ['flood zone 2', 395000, 341800, 'fz', '2', 'Sea', 'info-fz2-sea'],
      ['flood zone 3', 395047, 341830, 'fz', '3', 'River', 'info-fz3-river'],
      ['flood zone 3', 395047, 341830, 'fz', '3', 'River and sea', 'info-fz3-river-and-sea']
    ]

    tests.forEach(([description, x, y, ds, fz, fs, expectedGaId]) => {
      it(`should show the info panel for ${description}`, async () => {
        const expectedCoords = `${x},${y}`
        const url = `${infoPanelUrl}?x=${x}&y=${y}&ds=${ds}&fz=${fz}&fs=${fs}`
        const response = await submitGetRequest({ url })
        expect(response.statusCode).toEqual(200)
        const { payload } = response
        document.body.innerHTML = payload
        expect(document.getElementById(expectedGaId).textContent).toContain(expectedCoords)
        expect(payload).toMatchSnapshot()
      })
    })
  })
})
