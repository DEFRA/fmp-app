const { submitGetRequest } = require('../../__test-helpers__/server')

const infoPanelUrl = '/defra-map/info-panel'

describe('info-panel', () => {
  // beforeEach(async () => {
  // })

  const testGoogleAnalyticsId = async (expectedGaId) => {
    expect(document.getElementById(expectedGaId).textContent).toContain('COORDS')
  }

  const testTimeFrame = async (expectedTimeFrame) => {
    const element = document.getElementById('info-timeframe')
    expect(element.textContent).toContain(expectedTimeFrame)
  }

  const testTitleAndBody = async (expected, idPart, expectedContent) => {
    const titleElement = document.getElementById(`info-${idPart}-title`)
    const bodyElement = document.getElementById(`info-${idPart}-body`)
    if (expected) {
      expect(titleElement.textContent).toContain(expectedContent)
      expect(bodyElement).toBeDefined()
    } else {
      expect(titleElement).toBeNull()
      expect(bodyElement).toBeNull()
    }
  }

  const testListRow = async (expected, idPart, expectedContent) => {
    const titleElement = document.getElementById(`info-${idPart}`)
    if (expected) {
      expect(titleElement.textContent).toContain(expectedContent)
    } else {
      expect(titleElement).toBeNull()
    }
  }

  const testFloodZoneUpdates = async (expected) =>
    testTitleAndBody(expected, 'fz-updates', 'Updates to flood zones 2 and 3')

  const testHowToUseFZCC = async (expected) =>
    testTitleAndBody(expected, 'how-to-cc', 'How to use flood zones plus climate change')

  const testNoData = async (expected) =>
    testTitleAndBody(expected, 'fznd', 'Climate change data unavailable')

  const testFLoodZoneRow = async (expected, floodZone) =>
    testListRow(expected, 'flood-zone', floodZone)

  const testFLoodSourceRow = async (expected, floodSource) =>
    testListRow(expected, 'flood-source', floodSource)

  const testHowToUseUrl = async (expected) => {
    const titleElement = document.getElementById('info-how-to-cc-url')
    if (expected) {
      expect(titleElement.textContent).toContain('Find out more about flood map for planning data and how to use it')
    } else {
      expect(titleElement).toBeNull()
    }
  }

  describe('Flood Zones', () => {
    const tests = [
      ['flood zone 2', 'fz', '2', 'pd', 'Sea', 'info-fz2-sea'],
      ['flood zone 3', 'fz', '3', 'pd', 'River', 'info-fz3-river'],
      ['flood zone 3', 'fz', '3', 'pd', 'River and sea', 'info-fz3-river-and-sea'],
      ['flood zone cc', 'fz', 'cc', 'cc', 'River and sea', 'info-fzcc-river-and-sea'],
      ['flood zone nd', 'fz', 'nd', 'cc', '', 'info-fznodata']
    ]

    tests.forEach(([description, ds, fz, tf, fs, expectedGaId]) => {
      const url = `${infoPanelUrl}?ds=${ds}&fz=${fz}&tf=${tf}&fs=${fs}`

      it(`should show the info panel for ${description}`, async () => {
        const response = await submitGetRequest({ url })
        expect(response.statusCode).toEqual(200)
        const { payload } = response
        document.body.innerHTML = payload
        expect(payload).toMatchSnapshot()
        await testGoogleAnalyticsId(expectedGaId)
        await testFLoodZoneRow(fz === '2' || fz === '3', fz)
        await testFLoodSourceRow(Boolean(fs), fs)
        await testFloodZoneUpdates(fz === '2' || fz === '3', fz)
        await testTimeFrame(tf === 'cc' ? 'Climate change' : 'Present day')
        await testHowToUseFZCC(fz === 'cc')
        await testNoData(fz === 'nd')
        await testHowToUseUrl(tf === 'cc')
      })
    })
  })
})
