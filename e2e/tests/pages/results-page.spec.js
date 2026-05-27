import { test } from '../../fixtures.js'
import { pages } from '../../pages/index.js'
import { areaData, floodZonedata } from '../../data/location-data.js'

test.describe('Results page', () => {
  const slug = (polygon) => `/results?encodedPolygon=${encodeURIComponent(polygon)}`

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
    // The following tests validate that internal links can be reached.
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

    test('navigates to climate change allowances page when clicking the link', { tag: '@urlCheck' }, async ({ steps }) => {
      await steps.clickLink(pages.results.findOutMoreAboutClimateChangeAllowancesLink)
      await steps.expectUrlContains('flood-risk-assessments-climate-change-allowances')
    })

    test('navigates to products page when clicking the link', { tag: '@urlCheck' }, async ({ steps }) => {
      await steps.clickLink(pages.results.findOutWhatProductsAreAvailableLink)
      await steps.expectUrlContains('get-information-about-flood-risk-from-rivers-and-the-sea-to-help-you-to-complete-afra')
    })
  })

  test.describe('Conditional content checks', () => {
    const fraRequiredText =
      'Based on our flood risk data, you need to carry out a flood risk assessment (FRA) as part of the planning application for this development.'
    const fz1LessThan1HaText =
      'Developments in flood zone 1 that are less than 1 hectare (ha) only need a flood risk assessment (FRA) where'
    const fz1MoreThan1HaText =
      'Developments in flood zone 1 that are more than 1 hectare need a flood risk assessment (FRA).'
    const swAnnualChance = {
      1000: '0.1% (1 in 1000)',
      100: '1% (1 in 100)',
      30: '3.3% (1 in 30)'
    }
    const swChancePdAnd2061to2125 = (annualChance) =>
      `Between 2061 and 2125 the chance of surface water flooding at this location could be ${annualChance} each year.`
    const swChancePd = (annualChance) =>
      `The chance of surface water flooding at this location could be more than ${annualChance} each year.`
    const noJurisdictionText = 'We cannot identify the correct Environment Agency team for your location.'

    // Note, not all scenarios are currently covered.
    const riskIntro = 'In your proposed development site there is a risk of flooding from:'
    const riskProfiles = {
      1: [riskIntro, 'surface water'],
      2: [riskIntro, 'rivers (fluvial)', 'surface water'],
      3: [riskIntro, 'the sea (tidal)', 'surface water'],
      4: [riskIntro, 'rivers and the sea (fluvial and tidal)', 'surface water'],
      5: [riskIntro, 'rivers and the sea (fluvial and tidal)'],
      6: [riskIntro, 'rivers (fluvial)'],
      7: [riskIntro, 'the sea (tidal)'],
      8: [riskIntro, 'rivers and the sea (fluvial or tidal) due to climate change'],
      9: [riskIntro, 'rivers and the sea (fluvial or tidal) due to climate change', 'surface water']
    }
    const allRiskLines = [...new Set(Object.values(riskProfiles).flat().filter((line) => line !== riskIntro))]

    // Results page content validation tests.
    const scenarios = [
      // The following tests validate Flood Zone 1 behaviours.
      {
        name: 'shows order flood risk data link when in Flood Zone 1 and area is less than 1 hectare RP1',
        floodZone: '1',
        polygon: () => floodZonedata.FZ1_With_SW_and_Area_LT_1Hectare,
        riskProfile: 1,
        assertOnlyRiskProfile: true,
        expectText: [fz1LessThan1HaText],
        expectTextNotExists: [fraRequiredText, fz1MoreThan1HaText,],
        expectLinks: [pages.results.orderFloodRiskDataButton]
      },
      {
        name: 'shows order flood risk data link when in Flood Zone 1 and area is greater than 1 hectare RP3',
        floodZone: '1',
        polygon: () => floodZonedata.FZ1_With_SW_and_S,
        riskProfile: 3,
        assertOnlyRiskProfile: true,
        expectText: [fraRequiredText, fz1MoreThan1HaText],
        expectTextNotExists: [fz1LessThan1HaText],
        expectLinks: [pages.results.orderFloodRiskDataButton]
      },
      {
        name: 'shows order flood risk data link when in Flood Zone 1 in an area where climate change data is unavailable RP9',
        floodZone: '1',
        polygon: () => floodZonedata.FZ1_With_CC_Unavailable_and_SW,
        riskProfile: 9,
        assertOnlyRiskProfile: true,
        expectText: [fz1LessThan1HaText],
        expectTextNotExists: [fraRequiredText, fz1MoreThan1HaText,],
        expectLinks: [pages.results.orderFloodRiskDataButton]
      },
      // The following tests validate the presence of surface water probability messaging based on the presence of surface water data and the risk profile.
      {
        name: 'shows surface water probability messaging for 1 in 1000 present day and 2061 to 2125 in Flood Zone 1',
        floodZone: '1',
        polygon: () => floodZonedata.FZ1_SW_1in1000_PD_and_2061to2125,
        riskProfile: 1,
        assertOnlyRiskProfile: true,
        expectText: [swChancePdAnd2061to2125(swAnnualChance[1000]), swChancePd(swAnnualChance[1000])],
        expectLinks: [pages.results.orderFloodRiskDataButton]
      },
      {
        name: 'shows surface water probability messaging for 1 in 100 present day and 2061 to 2125 in Flood Zone 1',
        floodZone: '1',
        polygon: () => floodZonedata.FZ1_SW_1in100_PD_and_2061to2125,
        riskProfile: 1,
        assertOnlyRiskProfile: true,
        expectText: [swChancePdAnd2061to2125(swAnnualChance[100]), swChancePd(swAnnualChance[100])],
        expectLinks: [pages.results.orderFloodRiskDataButton]
      },
      {
        name: 'shows surface water probability messaging for 1 in 30 present day and 2061 to 2125 in Flood Zone 1',
        floodZone: '1',
        polygon: () => floodZonedata.FZ1_SW_1in30_PD_and_2061to2125,
        riskProfile: 1,
        assertOnlyRiskProfile: true,
        expectText: [swChancePdAnd2061to2125(swAnnualChance[30]), swChancePd(swAnnualChance[30])],
        expectLinks: [pages.results.orderFloodRiskDataButton]
      },
      // The following tests validate Flood Zone 2 and 3 content.
      {
        name: 'shows order flood risk data link when in Flood Zone 2 RP4',
        floodZone: '2',
        polygon: () => floodZonedata.FZ2_With_SW_and_S_and_R,
        riskProfile: 4,
        assertOnlyRiskProfile: true,
        expectText: [fraRequiredText],
        expectLinks: [pages.results.orderFloodRiskDataButton]
      },
      {
        name: 'shows order flood risk data link when in Flood Zone 3 RP2',
        floodZone: '3',
        polygon: () => floodZonedata.FZ3_With_SW_and_R,
        riskProfile: 2,
        assertOnlyRiskProfile: true,
        expectText: [fraRequiredText],
        expectLinks: [pages.results.orderFloodRiskDataButton]
      },
      {
        name: 'shows order flood risk data link when in Flood Zone 3 RP6',
        floodZone: '3',
        polygon: () => floodZonedata.FZ3_With_R,
        riskProfile: 6,
        assertOnlyRiskProfile: true,
        expectText: [fraRequiredText],
        expectLinks: [pages.results.orderFloodRiskDataButton]
      },
      // The following tests validate the presence of the order flood risk data link, based on the size of the polygon or whether the area is opted-in or opted-out.
      {
        name: 'has link to order flood risk data when in an opted-in area under 300 hectares',
        floodZone: '3',
        polygon: () => floodZonedata.polygon300,
        expectLinks: [pages.results.orderFloodRiskDataButton]
      },
      {
        name: 'does not show order flood risk data link when in an opted-in area over 300 hectares',
        floodZone: '3',
        polygon: () => floodZonedata.polygon300_01,
        expectLinksNotExists: [pages.results.orderFloodRiskDataButton]
      },
      {
        name: 'shows an Edit boundary button which can be clicked to navigate back to the map page when in an opted-in area over 300 hectares',
        floodZone: '3',
        polygon: () => floodZonedata.polygon300_01,
        expectLinks: [pages.results.editBoundaryLink],
        postAssert: async ({ steps }) => {
          await steps.clickLink(pages.results.editBoundaryLink)
          await steps.expectOn(pages.map.page)
        }
      },
      {
        name: 'does not show order flood risk data link when in an opted-out area',
        floodZone: '1',
        polygon: () => areaData.HertfordshireAndNorthLondon.polygon,
        expectOn: pages.results.pageWithZone('1'),
        expectLinksNotExists: [pages.results.orderFloodRiskDataButton]
      },
      {
        name: 'has link to order flood risk data button when in an opted-out area when using internal URL',
        floodZone: '1',
        polygon: () => areaData.HertfordshireAndNorthLondon.polygon,
        tag: '@internal',
        expectOn: pages.results.pageWithZone('1'),
        expectLinks: [pages.results.orderFloodRiskDataButton]
      },
      // The following tests validate the presence of the order flood risk data link for edge case border areas and areas outside of area team jurisdiction.
      {
        name: 'has link to order flood risk data when in an area which is on the England-Wales border',
        floodZone: '3',
        polygon: () => floodZonedata.England_Wales_Border,
        expectLinks: [pages.results.orderFloodRiskDataButton]
      },
      {
        name: 'has link to order flood risk data when in an area which is on the England-Scotland border',
        floodZone: '1',
        polygon: () => floodZonedata.England_Scotland_Border,
        expectLinks: [pages.results.orderFloodRiskDataButton]
      },
      {
        name: 'does not show order flood risk data link and confirms messaging when in an area which is not under an area teams jurisdiction',
        floodZone: '3',
        polygon: () => floodZonedata.area_Team_NoJurisdiction,
        expectText: [noJurisdictionText],
        expectLinksNotExists: [pages.results.orderFloodRiskDataButton]
      }
    ]

    const runList = async (items, fn) => {
      for (const item of items ?? []) {
        await fn(item)
      }
    }

    async function assertRiskProfile (steps, scenario) {
      if (!scenario.riskProfile) {
        return
      }

      const expectedRiskLines = riskProfiles[scenario.riskProfile] ?? []
      await runList(expectedRiskLines, (line) => steps.expectText(line))

      if (!scenario.assertOnlyRiskProfile) {
        return
      }

      for (const line of allRiskLines) {
        if (!expectedRiskLines.includes(line)) {
          await steps.expectTextNotExists(line)
        }
      }
    }

    async function runScenario (steps, scenario) {
      const polygon = scenario.polygon()

      await steps.open({
        ...pages.results.pageWithZone(scenario.floodZone),
        slug: slug(polygon)
      })

      if (scenario.expectOn) {
        await steps.expectOn(scenario.expectOn)
      }

      const assertionPlan = [
        { items: scenario.expectText, fn: (item) => steps.expectText(item) },
        { items: scenario.expectTextNotExists, fn: (item) => steps.expectTextNotExists(item) },
        { items: scenario.expectLinks, fn: (item) => steps.expectLinkExists(item) },
        { items: scenario.expectLinksNotExists, fn: (item) => steps.expectLinkNotExists(item) }
      ]

      for (const { items, fn } of assertionPlan) {
        await runList(items, fn)
      }

      await assertRiskProfile(steps, scenario)

      if (scenario.postAssert) {
        await scenario.postAssert({ steps })
      }
    }

    for (const scenario of scenarios) {
      const run = async ({ steps }) => {
        await runScenario(steps, scenario)
      }

      if (scenario.tag) {
        test(scenario.name, { tag: scenario.tag }, run)
      } else {
        test(scenario.name, run)
      }
    }
  })

  // The following tests exercise the P1 PDF download functionality.
  test.describe('PDF download checks', () => {
    const expectedPdfLinks = [
      'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3',
      'https://flood-map-for-planning.service.gov.uk/os-terms'
    ]

    const pdfScenarios = [
      { label: 'flood zone 1', floodZone: '1', polygon: floodZonedata.FZ1_WithOut_SW_and_RandS_Area_LT_1Hectare },
      { label: 'flood zone 2', floodZone: '2', polygon: floodZonedata.FZ2_With_R },
      { label: 'flood zone 3', floodZone: '3', polygon: floodZonedata.FZ3_With_SW_and_R }
    ]

    for (const { label, floodZone, polygon } of pdfScenarios) {
      test(`downloads pdf with reference and scale for ${label}`, async ({ steps, pdfDriver }) => {
        const reference = 'Test123456789101112131415'
        const scale = '25000'

        await steps.open({ ...pages.results.pageWithZone(floodZone), slug: slug(polygon) })
        await steps.clickDetails(pages.results.addReferenceToFloodMapDetails)
        await steps.type(pages.results.addReferenceInput, reference)
        await steps.select(pages.results.scaleSelect, scale)

        const downloadPromise = pdfDriver.awaitDownload()
        await steps.clickButton(pages.results.downloadFloodMapButton)
        const pdf = await pdfDriver.parsePdf(await downloadPromise)

        pdfDriver.expectPdfContent(pdf, { reference, scale, floodZone, polygon, expectedLinks: expectedPdfLinks })
      })
    }

    test('defaults to unspecified reference when none provided', async ({ steps, pdfDriver }) => {
      const polygon = floodZonedata.FZ1_WithOut_SW_and_RandS_Area_LT_1Hectare
      const scale = '2500'

      await steps.open({ ...pages.results.pageWithZone('1'), slug: slug(polygon) })
      await steps.clickDetails(pages.results.addReferenceToFloodMapDetails)
      await steps.select(pages.results.scaleSelect, scale)

      const downloadPromise = pdfDriver.awaitDownload()
      await steps.clickButton(pages.results.downloadFloodMapButton)
      const pdf = await pdfDriver.parsePdf(await downloadPromise)

      pdfDriver.expectPdfContent(pdf, { scale, floodZone: '1', polygon, expectedLinks: expectedPdfLinks })
    })
  })
})
