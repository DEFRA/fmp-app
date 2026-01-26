const { submitGetRequest } = require('../../__test-helpers__/server')

const infoPanelUrl = '/defra-map/info-panel'

describe('info-panel', () => {
  // beforeEach(async () => {
  // })

  const testTimeFrame = async (expectedTimeFrame) => {
    const element = document.getElementById('info-timeframe')
    expect(element.textContent).toContain(expectedTimeFrame)
  }

  const testHowToUseFZCC = async (expected) => {
    const titleElement = document.getElementById('info-how-to-cc-title')
    const bodyElement = document.getElementById('info-how-to-cc-body')
    if (expected) {
      expect(titleElement.textContent).toContain('How to use flood zones plus climate change')
      expect(bodyElement).toBeDefined()
    } else {
      expect(titleElement).toBeNull()
      expect(bodyElement).toBeNull()
    }
  }

  const testNoData = async (expected) => {
    const titleElement = document.getElementById('info-fznd-title')
    const bodyElement = document.getElementById('info-fznd-body')
    if (expected) {
      expect(titleElement.textContent).toContain('Climate change data unavailable')
      expect(bodyElement).toBeDefined()
    } else {
      expect(titleElement).toBeNull()
      expect(bodyElement).toBeNull()
    }
  }

  describe('Flood Zones', () => {
    const tests = [
      ['flood zone 2', 395000, 341800, 'fz', '2', 'pd', 'Sea', 'info-fz2-sea'],
      ['flood zone 3', 395047, 341830, 'fz', '3', 'pd', 'River', 'info-fz3-river'],
      ['flood zone 3', 395047, 341830, 'fz', '3', 'pd', 'River and sea', 'info-fz3-river-and-sea'],
      ['flood zone cc', 395047, 341830, 'fz', 'cc', 'cc', 'River and sea', 'info-fzcc-river-and-sea'],
      ['flood zone nd', 395047, 341830, 'fz', 'nd', 'cc', '', 'info-fznodata']
    ]

    tests.forEach(([description, x, y, ds, fz, tf, fs, expectedGaId]) => {
      const expectedCoords = `${x},${y}`
      const url = `${infoPanelUrl}?x=${x}&y=${y}&ds=${ds}&fz=${fz}&tf=${tf}&fs=${fs}`

      it(`should show the info panel for ${description}`, async () => {
        const response = await submitGetRequest({ url })
        expect(response.statusCode).toEqual(200)
        const { payload } = response
        document.body.innerHTML = payload
        expect(document.getElementById(expectedGaId).textContent).toContain(expectedCoords)
        expect(payload).toMatchSnapshot()
        await testTimeFrame(tf === 'cc' ? 'Climate change' : 'Present day')
        await testHowToUseFZCC(fz === 'cc')
        await testNoData(fz === 'nd')
      })
    })
  })
})
