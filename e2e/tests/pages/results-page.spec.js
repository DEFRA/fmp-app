import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'
import { areaData, floodZonedata } from '../../data/location-data.js'
import { PdfDriver } from '../../test-runner-api/pdf-driver.js'

test.describe('Results page', () => {
  const slug = (polygon) => `/results?encodedPolygon=${encodeURIComponent(polygon)}`
  const expectedPdfLinks = [
    'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3',
    'https://flood-map-for-planning.service.gov.uk/os-terms'
  ]

  // Flood zone rendering
  for (const [index, { polygon, floodZone }] of Object.values(areaData).entries()) {
    test(`displays correct flood zone information for area ${index + 1}`, async ({ steps }) => {
      await steps.open({
        ...pages.results.pageWithZone(floodZone),
        slug: slug(polygon)
      })
      await steps.expectOn(pages.results.pageWithZone(floodZone))
    })
  }

  test.describe('Link and content tests', () => {
    const { polygon, floodZone } = areaData.Yorkshire

    test.beforeEach(async ({ steps }) => {
      await steps.open({
        ...pages.results.pageWithZone(floodZone),
        slug: slug(polygon)
      })
    })

    test('navigates to the Flood zones and what they mean page when clicking the link', async ({ steps }) => {
      await steps.clickLink(pages.results.findOutMoreAboutFloodZonesLink)
      await steps.expectOn(pages.floodZoneResultsExplained.page)
    })

    test('navigates to the how to use flood data page when clicking the find out more about this data and how it should be used link', async ({ steps }) => {
      await steps.clickLink(pages.results.findOutMoreAboutThisDataLink)
      await steps.expectOn(pages.howToUseFloodMapForPlanningData.page)
    })

    test('navigates to map page when clicking the see risk on map link', async ({ steps }) => {
      await steps.clickLinkContainingText(pages.results.seeThisRiskOnTheMapLink)
      await steps.expectOn(pages.map.page)
    })

    test('navigates to map page when clicking the redraw boundary link', async ({ steps }) => {
      await steps.clickLink(pages.results.redrawBoundaryLink)
      await steps.expectOn(pages.map.page)
    })

    test('navigates to the next steps page when clicking the link', async ({ steps }) => {
      await steps.clickLink(pages.results.iNeedHelpDecidingWhatToIncludeInMyPlanningAppLink)
      await steps.expectOn(pages.nextSteps.page)
    })

    test('navigates to location page when clicking the link', async ({ steps }) => {
      await steps.clickLink(pages.results.searchForDifferentLocationLink)
      await steps.expectOn(pages.location.page)
    })

    test('navigates to terms and conditions page when clicking the link', async ({ steps }) => {
      await steps.clickLink(pages.results.termsAndConditionsLink)
      await steps.expectOn(pages.termsAndConditions.page)
    })

    // The following tests validate that external links can be reached.
    test('navigates to Addressing residual risk page when when clicking the link', { tag: '@urlCheck' }, async ({ steps }) => {
      await steps.clickLink(pages.results.residualRiskLink)
      await steps.expectUrlContains('flood-risk-and-coastal-change#para41')
    })

    /* Climate change allowances link is shown only when SW goes into the app.
    test('navigates to climate change allowances page when clicking the link', { tag: '@urlCheck' }, async ({ steps }) => {
      await steps.clickLink(pages.results.findOutMoreAboutClimateChangeAllowancesLink)
      await steps.expectUrlContains('flood-risk-assessments-climate-change-allowances')
    })
    */

    test('navigates to products page when clicking the link', { tag: '@urlCheck' }, async ({ steps }) => {
      await steps.clickLink(pages.results.findOutWhatProductsAreAvailableLink)
      await steps.expectUrlContains('get-information-about-flood-risk-from-rivers-and-the-sea-to-help-you-to-complete-afra')
    })
  })

  test.describe('Conditional content checks', () => {
    // The following tests validate the presence of the order flood risk data link based size of polygon and whether the area is opted-in or opted-out.
    test('has link to order flood risk data when in an opted-in area under 300 hectares', async ({ steps }) => {
      const polygon = floodZonedata.polygon300
      await steps.open({
        ...pages.results.pageWithZone('3'),
        slug: slug(polygon)
      })
      await steps.expectLinkExists(pages.results.orderFloodRiskDataButton)
    })

    test('does not show order flood risk data link when in an opted-in area over 300 hectares', async ({ steps }) => {
      const polygon = floodZonedata.polygon300_01
      await steps.open({
        ...pages.results.pageWithZone('3'),
        slug: slug(polygon)
      })
      await steps.expectLinkNotExists(pages.results.orderFloodRiskDataButton)
    })

    test('shows an Edit boundary button which can be clicked to navigate back to the map page when in an opted-in area over 300 hectares', async ({ steps }) => {
      const polygon = floodZonedata.polygon300_01
      await steps.open({
        ...pages.results.pageWithZone('3'),
        slug: slug(polygon)
      })
      await steps.expectLinkExists(pages.results.editBoundaryLink)
      await steps.clickLink(pages.results.editBoundaryLink)
      await steps.expectOn(pages.map.page)
    })

    test('does not show order flood risk data link when in an opted-out area', async ({ steps }) => {
      const { polygon } = areaData.HertfordshireAndNorthLondon
      await steps.open({
        ...pages.results.pageWithZone('1'),
        slug: slug(polygon)
      })
      await steps.expectOn(pages.results.pageWithZone('1'))
      await steps.expectLinkNotExists(pages.results.orderFloodRiskDataButton)
    })

    test('has link to order flood risk data button when in an opted-out area when using internal URL', { tag: '@internal' }, async ({ steps }) => {
      const { polygon } = areaData.HertfordshireAndNorthLondon
      await steps.open({
        ...pages.results.pageWithZone('1'),
        slug: slug(polygon)
      })
      await steps.expectOn(pages.results.pageWithZone('1'))
      await steps.expectLinkExists(pages.results.orderFloodRiskDataButton)
    })
  })

  test.describe('PDF download checks', () => {
    test.beforeAll(async () => {
      await new PdfDriver().clearPdfFiles()
    })

    const pdfScenarios = [
      {
        label: 'flood zone 1',
        floodZone: '1',
        polygon: floodZonedata.FZ1_With_RandS
      },
      {
        label: 'flood zone 2',
        floodZone: '2',
        polygon: floodZonedata.FZ2_With_RandS
      },
      {
        label: 'flood zone 3',
        floodZone: '3',
        polygon: floodZonedata.FZ3_With_SW_and_RandS
      }
    ]

    for (const { label, floodZone, polygon } of pdfScenarios) {
      const pdfSlug = `/results?encodedPolygon=${encodeURIComponent(polygon)}`
      const pdfDownloadTimeoutMs = 60000

      test.describe(`for ${label}`, () => {
        test.beforeEach(async ({ page, steps }) => {
          await steps.open({
            ...pages.results.pageWithZone(floodZone),
            slug: pdfSlug
          })
          await page.locator('.govuk-details__summary').first().click()
        })

        test('downloads pdf without reference text', async ({ steps, pdfDriver }) => {
          const scale = '2500'
          await steps.select(pages.results.scaleSelect, scale)

          const pdfPath = await pdfDriver.waitForDownload(async () => {
            await steps.clickButton(pages.results.downloadFloodMapButton)
          }, pdfDownloadTimeoutMs)
          const pdf = await pdfDriver.parsePdf(pdfPath)

          await pdfDriver.expectCoreContent(pdf, { scale })
          await pdfDriver.expectFloodZone(pdf, floodZone)
          await pdfDriver.expectLocation(pdf, polygon)
          await pdfDriver.expectRequiredLinks(pdf, expectedPdfLinks)
          await pdfDriver.expectAllLinksAreValid(pdf)
        })

        test('downloads pdf with reference text and amended scale', async ({ steps, pdfDriver }) => {
          const referenceText = 'Test123456789101112131415'
          const scale = '25000'
          await steps.type(pages.results.addReferenceInput, referenceText)
          await steps.select(pages.results.scaleSelect, scale)

          const pdfPath = await pdfDriver.waitForDownload(async () => {
            await steps.clickButton(pages.results.downloadFloodMapButton)
          }, pdfDownloadTimeoutMs)
          const pdf = await pdfDriver.parsePdf(pdfPath)

          await pdfDriver.expectCoreContent(pdf, { reference: referenceText, scale })
          await pdfDriver.expectFloodZone(pdf, floodZone)
          await pdfDriver.expectLocation(pdf, polygon)
          await pdfDriver.expectRequiredLinks(pdf, expectedPdfLinks)
          await pdfDriver.expectAllLinksAreValid(pdf)
        })
      })
    }
  })
})
