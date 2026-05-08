import { expect, test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'

test.describe('Map page', () => {
  const closePanelButtonName = pages.map.bannerCloseButton.text
  const query = 'qzxwvvbnnmm112233445566778899'
  const validQuery = 'Leeds'

  const expectVisibleByRole = async (page, role, options) => {
    for (const option of options) {
      await expect(page.getByRole(role, { name: option.text, exact: true })).toBeVisible()
    }
  }

  const expectVisibleMenuSections = async (page) => {
    for (const section of pages.map.configSectionMenus) {
      await expect(page.getByRole('button', { name: new RegExp(section.text, 'i') })).toBeVisible()
    }
  }

  const dismissPanel = async (container) => {
    await container.getByRole('button', { name: closePanelButtonName, exact: true }).click()
  }

  const expectMapLayersUpdate = async (page, mapSteps, options) => {
    const viewport = pages.map.getMapViewport(page)
    await expectVisibleByRole(page, 'radio', options)
    await mapSteps.chooseMenuOption(options[0])
    let before = await viewport.screenshot()
    for (const option of options.slice(1)) {
      await mapSteps.chooseMenuOption(option)
      await expect.poll(async () => {
        const after = await viewport.screenshot()
        return Buffer.compare(before, after) !== 0
      }, { timeout: 7000, intervals: [200, 400, 800] }).toBe(true)
      before = await viewport.screenshot()
    }
  }

  test.beforeEach(async ({ steps }) => {
    await steps.open(pages.map.page)
    await steps.expectOn(pages.map.page)
  })

  // Verifies location controls are visible; Edit/Delete remain disabled until a shape is drawn.
  test('shows map configuration panel controls', async ({ mapSteps, page }) => {
    await expectVisibleMenuSections(page)

    await mapSteps.expandMenuSection(pages.map.locationMenuSection)
    for (const option of [pages.map.editShapeOption, pages.map.deleteShapeOption]) {
      const control = pages.map.getMapButton(page, option)
      await expect(control).toBeVisible()
      await expect(control).toBeDisabled()
    }

    await expect(page.getByRole('slider', { name: 'Layer opacity' })).toBeVisible()
  })

  // Verifies Add Polygon and Add Square controls are visible and enabled.
  test('shows Add Polygon and Add Square controls as available', async ({ mapSteps, page }) => {
    await mapSteps.expandMenuSection(pages.map.locationMenuSection)

    for (const option of [pages.map.addPolygonOption, pages.map.addSquareOption]) {
      const control = pages.map.getMapButton(page, option)
      await expect(control).toBeVisible()
      await expect(control).toBeEnabled()
    }
  })

  // Verifies dataset options are visible and selecting each one updates the rendered map layer.
  test('shows dataset options and updates map layers when selected', async ({ mapSteps, page }) => {
    await mapSteps.expandMenuSection(pages.map.datasetsMenuSection)
    await expectMapLayersUpdate(page, mapSteps, pages.map.datasetOptions)
  })

  test.describe('surface water dataset', () => {
    test.beforeEach(async ({ mapSteps, page }) => {
      await mapSteps.expandMenuSection(pages.map.datasetsMenuSection)
      await mapSteps.chooseMenuOption(pages.map.surfaceWaterOption)
    })

    // Verifies selecting Surface water swaps Climate change for Annual likelihood of flood menu, options are visible, and each updates the rendered map layer.
    test('shows annual likelihood options and updates map layers when selected', async ({ mapSteps, page }) => {
      await expect(page.getByRole('button', { name: /Climate change/i })).toBeHidden()
      await expect(page.getByRole('button', { name: /Annual likelihood of flood/i })).toBeVisible()
      await mapSteps.expandMenuSection(pages.map.annualLikelihoodMenuSection)
      await expectMapLayersUpdate(page, mapSteps, pages.map.annualLikelihoodOptions)
    })
  })

  // Verifies climate change options are visible and selecting each one updates the rendered map layer.
  test('shows climate change options and updates map layers when selected', async ({ mapSteps, page }) => {
    await mapSteps.expandMenuSection(pages.map.climateMenuSection)
    await expectMapLayersUpdate(page, mapSteps, pages.map.climateOptions)
  })

  // Verifies map feature switches are visible, toggle correctly, and update the Key panel.
  test('shows, toggles and reflects map feature switches in key panel', async ({ mapSteps, page }) => {
    const keyDialog = pages.map.getMapDialog(page, 'Key')
    await mapSteps.expandMenuSection(pages.map.mapFeaturesMenuSection)

    for (const option of pages.map.mapFeatureOptions) {
      const toggle = pages.map.getMapSwitch(page, option.text)
      await expect(toggle).toBeVisible()
      await expect(toggle).toHaveAttribute('aria-checked', 'false')

      const keyBefore = await keyDialog.screenshot()
      await toggle.click()
      await expect(toggle).toHaveAttribute('aria-checked', 'true')
      expect(Buffer.compare(keyBefore, await keyDialog.screenshot())).not.toBe(0)

      await toggle.click()
      await expect(toggle).toHaveAttribute('aria-checked', 'false')
    }
  })

  // Verifies the layer opacity slider UI is present with expected accessibility attributes.
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

    // Exercises the search button and verifies a search control is shown.
    test('opens map search when clicking search button', async ({ page }) => {
      await expect(pages.map.getMapSearchInput(page)).toBeVisible()
    })

    // Verifies an invalid query shows a no-results message.
    test('shows error message when searching for an area that does not exist', async ({ page }) => {
      await pages.map.getMapSearchInput(page).fill(query)
      await pages.map.getMapSearchInput(page).press('Enter')
      await expect(pages.map.getMapDialog(page, query)).toContainText('No results are available')
    })

    // Verifies a valid location search shows results and selecting one relocates the map.
    test('shows results when searching for a valid area and relocates map when selecting a result', async ({ page }) => {
      const initialUrl = page.url()
      const searchInput = pages.map.getMapSearchInput(page)

      await searchInput.fill(validQuery)
      await searchInput.press('Enter')
      await expect(pages.map.getMapDialog(page, validQuery)).toContainText(/result(s)? (is|are) available/i)

      await searchInput.press('ArrowDown')
      await searchInput.press('Enter')
      await page.waitForLoadState('networkidle')
      await expect(page).not.toHaveURL(initialUrl)
      await expect(pages.map.getMapViewport(page)).toBeVisible()
    })
  })

  test.describe('panel dismiss controls', () => {
    // Verifies the Key panel and map alert banner are present and can each be dismissed.
    test('shows and dismisses key panel and map alert banner', async ({ page }) => {
      const keyDialog = pages.map.getMapDialog(page, 'Key')
      const keyHeading = page.getByRole('heading', { name: 'Key', exact: true })
      const alertStatus = page.getByRole('status').filter({ hasText: 'Click on the flood zones for information' }).first()

      await expect(keyHeading).toBeVisible()
      await expect(alertStatus).toBeVisible()

      await dismissPanel(keyDialog)
      await expect(keyHeading).toBeHidden()

      await dismissPanel(alertStatus.locator('..'))
      await expect(alertStatus).toBeHidden()
    })
  })

  // Verifies zoom controls and map viewport are present.
  test('shows zoom in and zoom out buttons', async ({ page }) => {
    const zoomInButton = pages.map.getMapButton(page, pages.map.zoomInButton)
    const zoomOutButton = pages.map.getMapButton(page, pages.map.zoomOutButton)

    await expect(zoomInButton).toBeVisible()
    await expect(zoomOutButton).toBeVisible()
    await expect(pages.map.getMapViewport(page)).toBeVisible()
  })

  // Verifies style options are available when style menu is opened.
  test('shows map style options when style menu is opened', async ({ page, steps }) => {
    const styleOption = (option) => pages.map.getMapButton(page, option)

    await steps.clickButton(pages.map.mapStyleMenuButton)
    for (const option of pages.map.mapStyleOptions) {
      await expect(styleOption(option)).toBeVisible()
    }
  })

  // Confirms the Help link opens the map-help page in a new tab.
  test('navigates to map help page when clicking the map help link', async ({ steps }) => {
    await steps.clickLink(pages.map.mapHelpLink)
    await steps.switchToNewWindow()
    await steps.expectOn(pages.mapHelp.page)
  })
})
