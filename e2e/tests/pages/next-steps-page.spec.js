import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'
import { areaData, floodZonedata } from '../../data/location-data.js'
import { PdfDriver } from '../../test-runner-api/pdf-driver.js'

test.describe('Next steps page', () => {
  const slug = (polygon) => `/next-steps?encodedPolygon=${encodeURIComponent(polygon)}`
  const expectedPdfLinks = [
    'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3',
    'https://flood-map-for-planning.service.gov.uk/os-terms'
  ]

  test.describe('Link and content tests', () => {
    const polygon = areaData.Yorkshire.polygon

    test.beforeEach(async ({ steps }) => {
      await steps.open({ ...pages.nextSteps.page, slug: slug(polygon) })
    })

    test('displays next steps information', async ({ steps }) => {
      await steps.expectText('Next steps for your planning application')
    })

    test('navigates to the Flood zones and what they mean page when clicking the link', async ({ steps }) => {
      await steps.clickLink(pages.nextSteps.floodZonesAndWhatTheyMeanLink)
      await steps.expectOn(pages.floodZoneResultsExplained.page)
    })

    // The following tests validate that external links can be reached.

    test('navigates to Flood risk assessments: climate change allowances page when clicking the link', { tag: '@urlCheck' }, async ({ steps }) => {
      await steps.clickLink(pages.nextSteps.takeIntoAccountClimateChangeAllowancesLink)
      await steps.expectUrlContains('climate-change-allowances')
    })

    test('navigates to Flood risk assessments: applying for planning permission page when clicking the link', { tag: '@urlCheck' }, async ({ steps }) => {
      await steps.clickLink(pages.nextSteps.howToDoAnAssessmentLink)
      await steps.expectUrlContains('for-planning-applications')
    })

    test('navigates to Reservoirs map page when clicking the link', { tag: '@urlCheck' }, async ({ steps }) => {
      await steps.clickLink(pages.nextSteps.reservoirFloodRiskLink)
      await steps.expectUrlContains('Reservoirs')
    })

    test('navigates to Groundwater flooding page when clicking the link', { tag: '@urlCheck' }, async ({ steps }) => {
      await steps.clickLink(pages.nextSteps.britishGeologicalSurveyGroundwaterFloodingLink)
      await steps.expectUrlContains('groundwater-flooding')
    })

    test('navigates to Groundwater: current status and flood risk page when clicking the link', { tag: '@urlCheck' }, async ({ steps }) => {
      await steps.clickLink(pages.nextSteps.groundwaterCurrentStatusAndFloodRiskLink)
      await steps.expectUrlContains('groundwater-current-status-and-flood-risk')
    })

    test('navigates to Mining and groundwater constraints for development page when clicking the link', { tag: '@urlCheck' }, async ({ steps }) => {
      await steps.clickLink(pages.nextSteps.miningAndGroundwaterConstraintsForDevelopmentLink)
      await steps.expectUrlContains('mining-and-groundwater-constraints-for-development')
    })

    test('navigates to Addressing residual flood riskpage when clicking the link', { tag: '@urlCheck' }, async ({ steps }) => {
      await steps.clickLink(pages.nextSteps.residualRiskLink)
      await steps.expectUrlContains('flood-risk-and-coastal-change#para41')
    })

    test('navigates to Get information about flood risk from rivers and the sea to help you to complete a FRA page when clicking the link', { tag: '@urlCheck' }, async ({ steps }) => {
      await steps.clickLink(pages.nextSteps.findOutWhatProductsAreAvailableLink)
      await steps.expectUrlContains('get-information-about-flood-risk-from-rivers-and-the-sea-to-help-you-to-complete-afra')
    })
  })

  test.describe('Conditional content checks', () => {
    // The following tests validate the presence of the order flood risk data link based size of polygon and whether the area is opted-in or opted-out.
    test('has link to order flood risk data when in an opted-in area under 300 hectares', async ({ steps }) => {
      const polygon = floodZonedata.polygon300
      await steps.open({
        ...pages.nextSteps.page,
        slug: slug(polygon)
      })
      await steps.expectLinkExists(pages.nextSteps.orderFloodRiskDataButton)
    })

    test('does not show order flood risk data link when in an opted-in area over 300 hectares', async ({ steps }) => {
      const polygon = floodZonedata.polygon300_01
      await steps.open({
        ...pages.nextSteps.page,
        slug: slug(polygon)
      })
      await steps.expectLinkNotExists(pages.nextSteps.orderFloodRiskDataButton)
    })

    test('shows an Edit boundary button which can be clicked to navigate back to the map page when in an opted-in area over 300 hectares', async ({ steps }) => {
      const polygon = floodZonedata.polygon300_01
      await steps.open({
        ...pages.nextSteps.page,
        slug: slug(polygon)
      })
      await steps.expectLinkExists(pages.nextSteps.editBoundaryLink)
      await steps.clickLink(pages.nextSteps.editBoundaryLink)
      await steps.expectOn(pages.map.page)
    })

    test('does not show order flood risk data link when in an opted-out area', async ({ steps }) => {
      const { polygon } = areaData.HertfordshireAndNorthLondon
      await steps.open({
        ...pages.nextSteps.page,
        slug: slug(polygon)
      })
      await steps.expectOn(pages.nextSteps.page)
      await steps.expectLinkNotExists(pages.nextSteps.orderFloodRiskDataButton)
    })

    test('has link to order flood risk data button when in an opted-out area when using internal URL', { tag: '@internal' }, async ({ steps }) => {
      const { polygon } = areaData.HertfordshireAndNorthLondon
      await steps.open({
        ...pages.nextSteps.page,
        slug: `/next-steps?encodedPolygon=${encodeURIComponent(polygon)}`
      })
      await steps.expectOn(pages.nextSteps.page)
      await steps.expectLinkExists(pages.nextSteps.orderFloodRiskDataButton)
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
      const pdfSlug = `/next-steps?encodedPolygon=${encodeURIComponent(polygon)}`
      const pdfDownloadTimeoutMs = 60000

      test.describe(`for ${label}`, () => {
        test.beforeEach(async ({ page, steps }) => {
          await steps.open({
            ...pages.nextSteps.page,
            slug: pdfSlug
          })
          await page.locator('.govuk-details__summary').first().click()
        })

        test('downloads pdf without reference text', async ({ steps, pdfDriver }) => {
          const scale = '2500'
          await steps.select(pages.nextSteps.scaleSelect, scale)

          const pdfPath = await pdfDriver.waitForDownload(async () => {
            await steps.clickButton(pages.nextSteps.downloadFloodMapButton)
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

          const pdfPath = await pdfDriver.waitForDownload(async () => {
            await steps.type(pages.nextSteps.addReferenceInput, referenceText)
            await steps.select(pages.nextSteps.scaleSelect, scale)
            await steps.clickButton(pages.nextSteps.downloadFloodMapButton)
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
