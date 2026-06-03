import { expect, test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'

test.describe('Map page', () => {
  const query = 'qzxwvvbnnmm112233445566778899'
  const validQuery = 'Leeds'

  test.beforeEach(async ({ steps, page }) => {
    await steps.open(pages.map.page)
    await steps.expectOn(pages.map.page)
    await page.addStyleTag({
      content: `*, *::before, *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
      }`
    })
  })

  test('shows map configuration panel controls', async ({ mapSteps, page }) => {
    for (const section of pages.map.configSectionMenus) {
      await expect(page.getByRole('button', { name: new RegExp(section.text, 'i') })).toBeVisible()
    }
    await mapSteps.expandMenuSection(pages.map.locationMenuSection)
    for (const opt of [pages.map.editShapeOption, pages.map.deleteShapeOption]) {
      await expect(pages.map.getMapButton(page, opt)).toBeDisabled()
    }
    await expect(page.getByRole('slider', { name: 'Layer opacity' })).toBeVisible()
  })

  test('shows Add Polygon and Add Square controls as available', async ({ mapSteps, page }) => {
    await mapSteps.expandMenuSection(pages.map.locationMenuSection)
    for (const opt of [pages.map.addPolygonOption, pages.map.addSquareOption]) {
      await expect(pages.map.getMapButton(page, opt)).toBeEnabled()
    }
  })

  test('shows dataset options and updates map layers when selected', async ({ mapSteps }) => {
    await mapSteps.expandMenuSection(pages.map.datasetsMenuSection)
    await mapSteps.assertMultipleRadios(pages.map.datasetOptions, pages.map.datasetsMenuSection.text)
  })

  test.describe('surface water dataset', () => {
    test.beforeEach(async ({ mapSteps }) => {
      await mapSteps.expandMenuSection(pages.map.datasetsMenuSection)
      await mapSteps.assertRadioLayerChange(pages.map.surfaceWaterOption, pages.map.datasetsMenuSection.text, null)
    })

    test('shows surface water menu options and updates map layers when selected', async ({ mapSteps, page }) => {
      await expect(page.getByRole('button', { name: /Climate change/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /Annual likelihood/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /Depth/i })).toBeVisible()

      await mapSteps.expandMenuSection(pages.map.climateMenuSectionSW)
      await mapSteps.assertMultipleRadios(pages.map.climateOptionsSW, pages.map.climateMenuSectionSW.text, { checkKey: false })

      await mapSteps.expandMenuSection(pages.map.annualLikelihoodMenuSection)
      await mapSteps.assertMultipleRadios(pages.map.annualLikelihoodOptions, pages.map.annualLikelihoodMenuSection.text, { checkKey: false })

      await mapSteps.expandMenuSection(pages.map.surfaceWaterDepthMenuSection)
      await mapSteps.assertMultipleRadios(pages.map.surfaceWaterDepthOptions, pages.map.surfaceWaterDepthMenuSection.text)
    })
  })

  test('shows climate change options and updates map layers when selected', async ({ mapSteps }) => {
    await mapSteps.expandMenuSection(pages.map.climateMenuSection)
    await mapSteps.assertMultipleRadios(pages.map.climateOptions, pages.map.climateMenuSection.text)
  })

  test.describe('map feature switches', () => {
    test.beforeEach(async ({ steps, mapSteps, page }) => {
      await steps.open(pages.map.page)
      await steps.expectOn(pages.map.page)
      await page.addStyleTag({
        content: `*, *::before, *::after {
          animation: none !important;
          transition: none !important;
          scroll-behavior: auto !important;
        }`
      })
      await mapSteps.expandMenuSection(pages.map.mapFeaturesMenuSection)
    })

    for (const option of pages.map.mapFeatureOptions) {
      test(`shows "${option.text}" switch and updates key panel when enabled`, async ({ mapSteps, page }) => {
        const toggle = pages.map.getMapSwitch(page, option.text)
        await expect(toggle).toBeVisible()
        await expect(toggle).toHaveAttribute('aria-checked', 'false')

        const before = await mapSteps.getKeyText()
        await toggle.scrollIntoViewIfNeeded()
        await toggle.click()

        await expect(toggle).toHaveAttribute('aria-checked', 'true')
        await expect.poll(() => mapSteps.getKeyText(), {
          timeout: 10000,
          intervals: [200, 400, 800]
        }).not.toBe(before)
      })
    }
  })

  test('layer opacity slider is present', async ({ page }) => {
    const slider = page.getByRole('slider', { name: 'Layer opacity' })
    await expect(page.getByRole('group', { name: 'Layer opacity' })).toBeVisible()
    await expect(slider).toBeVisible()
    await expect(slider).toHaveAttribute('aria-valuemin', '0')
    await expect(slider).toHaveAttribute('aria-valuemax', '100')
    await expect(slider).toHaveAttribute('aria-valuenow', /\d+/)
  })

  test.describe('map search', () => {
    test.beforeEach(async ({ steps }) => {
      await steps.clickButton(pages.map.mapSearchButton)
    })

    test('opens map search when clicking search button', async ({ page }) => {
      await expect(pages.map.getMapSearchInput(page)).toBeVisible()
    })

    test('shows error message when searching for an area that does not exist', async ({ page }) => {
      const input = pages.map.getMapSearchInput(page)
      await input.fill(query)
      await input.press('Enter')
      await expect(pages.map.getMapDialog(page, query)).toContainText('No results are available')
    })

    test('shows results when searching for a valid area and relocates map when selecting a result', async ({ page }) => {
      const input = pages.map.getMapSearchInput(page)
      await input.fill(validQuery)
      await input.press('Enter')
      await expect(pages.map.getMapDialog(page, validQuery)).toContainText(/result(s)? (is|are) available/i)
      await input.press('Enter')
      await page.waitForLoadState('networkidle')
      await expect(pages.map.getMapViewport(page)).toBeVisible()
    })
  })

  test.describe('panel dismiss controls', () => {
    test('shows and dismisses key panel and map alert banner', async ({ mapSteps, page }) => {
      const kh = page.getByRole('heading', { name: 'Key', exact: true })
      const alert = page.getByRole('status').filter({ hasText: 'Click on the flood zones' }).first()

      await expect(kh).toBeVisible()
      await expect(alert).toBeVisible()

      await mapSteps.dismissKeyPanel()
      await expect(kh).toBeHidden()

      await mapSteps.dismissAlertBanner()
      await expect(alert).toBeHidden()
    })
  })

  test('shows zoom in and zoom out buttons', async ({ page }) => {
    await expect(pages.map.getMapButton(page, pages.map.zoomInButton)).toBeVisible()
    await expect(pages.map.getMapButton(page, pages.map.zoomOutButton)).toBeVisible()
    await expect(pages.map.getMapViewport(page)).toBeVisible()
  })

  test('shows map style options when style menu is opened', async ({ page, steps }) => {
    await steps.clickButton(pages.map.mapStyleMenuButton)
    for (const opt of pages.map.mapStyleOptions) {
      await expect(pages.map.getMapButton(page, opt)).toBeVisible()
    }
  })

  test('navigates to map help page when clicking the map help link', async ({ steps }) => {
    await steps.clickLink(pages.map.mapHelpLink)
    await steps.switchToNewWindow()
    await steps.expectOn(pages.mapHelp.page)
  })
})
