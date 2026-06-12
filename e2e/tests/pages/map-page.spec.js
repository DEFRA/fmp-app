import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'

test.describe('Map page', () => {
  test.beforeEach(async ({ mapSteps }) => {
    await mapSteps.open(pages.map.page)
    await mapSteps.waitForMapToLoad()
  })

  test('shows map configuration panel with all sections and slider', async ({ mapSteps }) => {
    await mapSteps.expectSectionVisible(pages.map.locationSection)
    await mapSteps.expectSectionVisible(pages.map.datasetsSection)
    await mapSteps.expectSectionVisible(pages.map.climateChangeSection)
    await mapSteps.expectSectionVisible(pages.map.mapFeaturesSection)
    await mapSteps.expectSliderAttributes('Layer opacity', {
      'aria-valuemin': '0',
      'aria-valuemax': '100',
      'aria-valuenow': /\d+/
    })
  })

  test('shows draw controls with edit and delete disabled', async ({ mapSteps }) => {
    await mapSteps.expandSection(pages.map.locationSection)
    await mapSteps.expectEnabled(pages.map.addPolygonOption)
    await mapSteps.expectEnabled(pages.map.addSquareOption)
    await mapSteps.expectDisabled(pages.map.editShapeOption)
    await mapSteps.expectDisabled(pages.map.deleteShapeOption)
  })

  test('updates map when selecting dataset options', async ({ mapSteps }) => {
    await mapSteps.expandSection(pages.map.datasetsSection)
    await mapSteps.assertRadiosUpdateMap(pages.map.datasetOptions)
  })

  test('updates map when selecting climate change options', async ({ mapSteps }) => {
    await mapSteps.expandSection(pages.map.climateChangeSection)
    await mapSteps.assertRadiosUpdateMap(pages.map.climateOptions)
  })

  test('updates key panel when enabling map feature switches', async ({ mapSteps }) => {
    await mapSteps.expandSection(pages.map.mapFeaturesSection)
    for (const element of pages.map.mapFeatureSwitches) {
      await mapSteps.assertSwitchUpdatesKey(element)
    }
  })

test.describe('surface water dataset', () => {
  test.beforeEach(async ({ mapSteps }) => {
    await mapSteps.expandSection(pages.map.datasetsSection)
    await mapSteps.chooseMenuOption(pages.map.surfaceWaterOption)
  })

  test('updates map when selecting climate change options', async ({ mapSteps }) => {
    await mapSteps.expandSection(pages.map.climateChangeSection)
    await mapSteps.assertRadiosUpdateMap(pages.map.climateOptionsSW)
  })

  test('updates map when selecting annual likelihood options', async ({ mapSteps }) => {
    await mapSteps.expandSection(pages.map.annualLikelihoodSection)
    await mapSteps.assertRadiosUpdateMap(pages.map.annualLikelihoodOptions)
  })

  test('updates map when selecting depth options', async ({ mapSteps }) => {
    await mapSteps.expandSection(pages.map.depthSection)
    await mapSteps.assertRadiosUpdateMap(pages.map.surfaceWaterDepthOptions)
  })
})

test.describe('map search', () => {
  test.beforeEach(async ({ mapSteps }) => {
    await mapSteps.openSearch()
  })

  test('shows no results for invalid search', async ({ mapSteps }) => {
    await mapSteps.search('qzxwvvbnnmm112233445566778899')
    await mapSteps.expectText('No results')
  })

  test('shows results and relocates map for valid search', async ({ mapSteps }) => {
    const prevUrl = mapSteps.page.url()
    await mapSteps.search('Leeds')
    await mapSteps.selectSearchResult()
    await mapSteps.expectUrlChanged(prevUrl)
  })
})

  test('dismisses key panel and alert banner', async ({ mapSteps }) => {
    await mapSteps.expectVisible('dialog', 'Key')
    await mapSteps.dismissPanel('Key')
    await mapSteps.expectHidden('dialog', 'Key')
    await mapSteps.dismissBanner(/flood zone/i)
})

  test('navigates to map help page', async ({ mapSteps }) => {
    await mapSteps.clickLink(pages.map.helpLink)
    await mapSteps.switchToNewWindow()
    await mapSteps.expectOn(pages.mapHelp.page)
  })
})
