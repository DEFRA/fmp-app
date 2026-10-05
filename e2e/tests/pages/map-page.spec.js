import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'

test.describe('Map page', () => {
  test.beforeEach(async ({ mapSteps }) => {
    await mapSteps.open(pages.map.page)
    await mapSteps.waitForMapToLoad()
  })

  test('shows map configuration panel with all sections and slider', async ({ mapSteps }) => {
    await mapSteps.expectMapPanelReady()
    await mapSteps.expectSectionVisible(pages.map.locationBoundarySection)
    await mapSteps.expectSliderAttributes('Layer opacity', {
      'aria-valuemin': '0',
      'aria-valuemax': '100',
      'aria-valuenow': /\d+/
    })
  })

  test('shows draw controls with edit and delete disabled', async ({ mapSteps }) => {
    await mapSteps.expectMapReady()
    await mapSteps.expandSection(pages.map.locationBoundarySection)
    await mapSteps.expectEnabled(pages.map.addPolygonOption)
    await mapSteps.expectEnabled(pages.map.addSquareOption)
    await mapSteps.expectDisabled(pages.map.editShapeOption)
    await mapSteps.expectDisabled(pages.map.deleteShapeOption)
  })

  test('updates map when selecting dataset options', async ({ mapSteps }) => {
    await mapSteps.expectMapPanelReady()
    await mapSteps.assertRadiosUpdateMap(pages.map.datasetOptions)
  })

  test('updates map when selecting climate change options', async ({ mapSteps }) => {
    await mapSteps.expectMapPanelReady()
    await mapSteps.assertRadiosUpdateMap(pages.map.climateOptions)
  })

  test('updates key panel when enabling map feature switches', async ({ mapSteps }) => {
    await mapSteps.expectKeyPanelVisible()
    for (const element of pages.map.mapFeatureSwitches) {
      await mapSteps.assertSwitchUpdatesKey(element)
    }
  })

  test('dismisses key panel', async ({ mapSteps }) => {
    await mapSteps.expectKeyPanelVisible()
    await mapSteps.dismissKeyPanel()
    await mapSteps.expectKeyPanelHidden()
  })

  test('navigates to map help page', async ({ mapSteps }) => {
    await mapSteps.expectMapReady()
    await mapSteps.clickLink(pages.map.helpLink)
    await mapSteps.switchToNewWindow()
    await mapSteps.expectOn(pages.mapHelp.page)
  })

  test.describe('surface water dataset', () => {
    test.beforeEach(async ({ mapSteps }) => {
      await mapSteps.chooseMenuOption(pages.map.surfaceWaterOption)
    })

    test('updates map when selecting climate change options', async ({ mapSteps }) => {
      await mapSteps.assertRadiosUpdateMap(pages.map.climateOptionsSW)
    })

    test('updates map when selecting annual likelihood options', async ({ mapSteps }) => {
      await mapSteps.assertRadiosUpdateMap(pages.map.annualLikelihoodOptions)
    })

    test('updates map when selecting depth options', async ({ mapSteps }) => {
      await mapSteps.assertRadiosUpdateMap(pages.map.surfaceWaterDepthOptions)
    })
  })

  test.describe('map search', () => {
    test.beforeEach(async ({ mapSteps }) => {
      await mapSteps.openSearch()
    })

    test('shows no results for invalid search', async ({ mapSteps }) => {
      await mapSteps.expectSearchReady()
      await mapSteps.search('qzxwvvbnnmm112233445566778899')
      await mapSteps.expectText('No results')
    })

    test('shows results and relocates map for valid search', async ({ mapSteps }) => {
      const prevUrl = mapSteps.currentUrl()
      await mapSteps.expectSearchReady()
      await mapSteps.search('Leeds')
      await mapSteps.selectSearchResult()
      await mapSteps.expectUrlChanged(prevUrl)
    })
  })
})
