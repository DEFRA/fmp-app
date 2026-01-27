const { submitGetRequest } = require('../../__test-helpers__/server')

const infoPanelUrl = '/defra-map/info-panel'

describe('info-panel', () => {
  const initDocument = async (url) => {
    const response = await submitGetRequest({ url })
    expect(response.statusCode).toEqual(200)
    const { payload } = response
    document.body.innerHTML = payload
    expect(document.body.innerHTML).toMatchSnapshot()
  }

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

  const testAepRow = async (expected, aepText) => {
    testListRow(expected, 'aep', aepText)
  }

  const testDepthRow = async (expected, depth) => {
    testListRow(expected, 'depth', depth)
  }

  const testSurfaceWaterClimateChange = async (expected) =>
    testListRow(expected, 'sw-cc-allowance', 'Surface water with climate change uses the ‘upper end’ allowance for the 2070s epoch (2061 to 2125)')

  const testSurfaceWaterBuilding = async (expected) => {
    testListRow(
      expected,
      'sw-building',
      'Surface water information tells you the flood risk of the land around a building and cannot tell you if individual buildings are at risk.'
    )
  }

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
        await initDocument(url)
        testGoogleAnalyticsId(expectedGaId)
        testFLoodZoneRow(fz === '2' || fz === '3', fz)
        testFLoodSourceRow(Boolean(fs), fs)
        testFloodZoneUpdates(fz === '2' || fz === '3', fz)
        testTimeFrame(tf === 'cc' ? 'Climate change' : 'Present day')
        testHowToUseFZCC(fz === 'cc')
        testNoData(fz === 'nd')
        testHowToUseUrl(tf === 'cc')
        testAepRow(false)
        testDepthRow(false)
        testSurfaceWaterBuilding(false)
        testSurfaceWaterClimateChange(false)
      })
    })
  })

  describe('Surface Water', () => {
    const aepText = {
      low: '0.1% (1 in 1000)',
      medium: '1% (1 in 100)',
      high: '3.3% (1 in 30)'
    }
    const aeps = ['low', 'medium', 'high']
    const depths = ['1200-2300mm']
    const timeFrames = ['pd', 'cc']
    aeps.forEach((aep) => depths.forEach((depth) => timeFrames.forEach((tf) => {
      const url = `${infoPanelUrl}?ds=sw&tf=${tf}&aep=${aep}&depth=${depth}`
      it(`should show the info panel for SW-${tf}-${aep} depth: ${depth}`, async () => {
        await initDocument(url)
        const expectedGaId = `info-sw-${aep}`
        testGoogleAnalyticsId(expectedGaId)
        testFLoodZoneRow(false)
        testFLoodSourceRow(false)
        testFloodZoneUpdates(false)
        testTimeFrame(tf === 'cc' ? 'Climate change' : 'Present day')
        testHowToUseFZCC(false)
        testNoData(false)
        testHowToUseUrl(tf === 'cc')
        testAepRow(true, 'chance of flooding each year')
        testAepRow(true, aepText[aep])
        testDepthRow(true, depth)
        testSurfaceWaterBuilding(true)
        testSurfaceWaterClimateChange(tf === 'cc')
      })
    })))
  })
})
