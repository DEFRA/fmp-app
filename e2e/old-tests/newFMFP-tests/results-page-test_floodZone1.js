const floodZoneResultsPage = require('../pageObjects/NewFMFP/flood-zone-results.js')
const { floodZonedata } = require('../../data/location-data.js')

describe('Results Page Test : Validate the Presence of Order Flood risk data button', () => {
  const fraTests = [
    [floodZonedata.FZ1_WithOut_SW_and_RandS_Area_LT_1Hectare, '1', 'LessThan1Hectare', 'NA', 'NA', 'Flood zone 1, without Surface water and Rivers and Sea  and Area less than 1 hectare'],
    [floodZonedata.FZ1_WithOut_SW_and_RandS_Area_GT_1Hectare, '1', 'GreaterThan1Hectare', 'NA', 'NA', 'Flood zone 1, without Surface water and Rivers and Sea  and Area greater than 1 hectare'],
    [floodZonedata.FZ1_With_SW_and_Area_GT_1Hectare, '1', 'GreaterThan1Hectare', 'SW', 'NA', 'Flood zone 1, with Surface water and Area greater than 1 hectare'],
    [floodZonedata.FZ1_With_SW_and_Area_LT_1Hectare, '1', 'LessThan1Hectare', 'SW', 'NA', 'Flood zone 1, with Surface water and Area less than 1 hectare'],
    [floodZonedata.FZ1_With_RandS, '1', 'NA', 'NA', 'RandS', 'Flood zone 1, with Rivers and Sea'],
    [floodZonedata.FZ1_With_SW_and_RandS, '1', 'NA', 'SW', 'RandS', 'Flood zone 1, with Surface water and Rivers and Sea'],
    [floodZonedata.FZ2_With_RandS, '2', 'NA', 'NA', 'RandS', 'Flood zone 2, with Rivers and Sea'],
    [floodZonedata.FZ2_With_SW_and_RandS, '2', 'NA', 'SW', 'RandS', 'Flood zone 2, with Surface water and Rivers and Sea'],
    [floodZonedata.FZ3_With_RandS, '3', 'NA', 'NA', 'RandS', 'Flood zone 3, with Rivers and Sea'],
    [floodZonedata.FZ3_With_SW_and_RandS, '3', 'NA', 'SW', 'RandS', 'Flood zone 3, with Surface water and Rivers and Sea']
  ]

  const swTests = [
    ['[[447934.73,215124.33],[448106.71,215124.33],[448106.71,214952.35],[447934.73,214952.35],[447934.73,215124.33]]', '3', '3.3% (1 in 30)', 'flood zone 3, with surface water flooding'],
    ['[[335915.27,505371.66],[336034.93,505371.66],[336034.93,505252],[335915.27,505252],[335915.27,505371.66]]', '1', '1% (1 in 100)', 'flood zone 3, with surface water flooding'],
    ['[[383070.6,398275.65],[383132.58,398275.65],[383132.58,398213.68],[383070.6,398213.68],[383070.6,398275.65]]', '3', '0.1% (1 in 1000)', 'flood zone 3, with surface water flooding']
  ]

  const nextStepsTests = [
    ['[[532441.17,212478.2],[532478.32,212478.2],[532478.32,212441.05],[532441.17,212441.05],[532441.17,212478.2]]', '1', false, 'flood zone 1, with Opted Out'],
    ['[[497462.13,372096.47],[497939.87,372096.47],[497939.87,371618.73],[497462.13,371618.73],[497462.13,372096.47]]', '1', false, 'flood zone 1, with Opted Out'],
    ['[[496500.92,371274.99],[496978.65,371274.99],[496978.65,370797.26],[496500.92,370797.26],[496500.92,371274.99]]', '3', false, 'flood zone 3, with Opted Out'],
    ['[[492831.96,372816.53],[493070.82,372816.53],[493070.82,372577.66],[492831.96,372577.66],[492831.96,372816.53]]', '2', false, 'flood zone 2, with Opted Out'],
    ['[[576608.04,155337.54],[576780.03,155337.54],[576780.03,155165.55],[576608.04,155165.55],[576608.04,155337.54]]', '1', true, 'flood zone 1, with Opted Out'],
    ['[[182342.59,44846.42],[182462.03,44846.42],[182462.03,44726.99],[182342.59,44726.99],[182342.59,44846.42]]', '2', true, 'flood zone 2, with Opted In'],
    ['[[407976.74,290551.19],[408013.89,290551.19],[408013.89,290514.04],[407976.74,290514.04],[407976.74,290551.19]]', '3', true, 'flood zone 3, with Opted In']
  ]

  fraTests.forEach(([polygon, expectedFloodZone, Area, SurfaceWater, RiversAndSea, description]) => {
    it(`Validate Flood Risk Assesment Data in Results Page for ${description}`, async () => {
      await browser.url(`${browser.options.baseUrl}/results?polygon=${polygon}`)

      // step 2: Verify SW and RandS Text in the list

      // check for both Surface water and Rivers and Sea text
      if (SurfaceWater === 'SW' && RiversAndSea === 'RandS') {
        await expect(await floodZoneResultsPage.isSwAndRandSHeaderDisplayed()).toEqual(true)
        await expect(await floodZoneResultsPage.isSWTextDisplayed()).toEqual(true)
        await expect(await floodZoneResultsPage.isRandSTextDisplayed()).toEqual(true)
      } else if (SurfaceWater === 'SW' && RiversAndSea === 'NA') {
        await expect(await floodZoneResultsPage.isSwAndRandSHeaderDisplayed()).toEqual(true)
        await expect(await floodZoneResultsPage.isSWTextDisplayed()).toEqual(true)
        await expect(await floodZoneResultsPage.isRandSTextDisplayed()).toEqual(false)
      } else if (SurfaceWater === 'NA' && RiversAndSea === 'RandS') {
        await expect(await floodZoneResultsPage.isSwAndRandSHeaderDisplayed()).toEqual(true)
        await expect(await floodZoneResultsPage.isSWTextDisplayed()).toEqual(false)
        await expect(await floodZoneResultsPage.isRandSTextDisplayed()).toEqual(true)
      } else if (SurfaceWater === 'NA' && RiversAndSea === 'NA') {
        await expect(await floodZoneResultsPage.isSwAndRandSHeaderDisplayed()).toEqual(false)
        await expect(await floodZoneResultsPage.isSWTextDisplayed()).toEqual(false)
        await expect(await floodZoneResultsPage.isRandSTextDisplayed()).toEqual(false)
      }

      // step 3: Verify Flood Risk Assesments Text
      await floodZoneResultsPage.isCoreTexts_Displayed()
      // check bullet points

      // check fra for less than 1 hecatre and more than 1 hectare
      if (Area === 'LessThan1Hectare') {
        await floodZoneResultsPage.verifyFRA_FZ1_LT_1HectareSection()
        await expect(await floodZoneResultsPage.verifyFraRequired_isDisplayed()).toEqual(false)
        await expect(await floodZoneResultsPage.verifyFra_FZ1_GT_1Hectare_isDisplayed()).toEqual(false)
      } else if (Area === 'MoreThan1Hectare') {
        await expect(await floodZoneResultsPage.verifyFra_FZ1_GT_1Hectare_isDisplayed()).toEqual(true)
        await expect(await floodZoneResultsPage.verifyFraRequired_isDisplayed()).toEqual(true)
      }

      if (expectedFloodZone === '2' || expectedFloodZone === '3') {
        await expect(await floodZoneResultsPage.verifyFraRequired_isDisplayed()).toEqual(true)
        await expect(await floodZoneResultsPage.verifyFra_FZ1_GT_1Hectare_isDisplayed()).toEqual(false)
      }

      // Verify that area should be displayed for flood zone 1.
      if (expectedFloodZone === '1') {
        await expect(await floodZoneResultsPage.isAreaDisplayed()).toEqual(true)
      }
    })
  })

  swTests.forEach(([polygon, expectedFloodZone, probability, description]) => {
    it(`Validate Surface water Section Data in Results Page Information for ${description}`, async () => {
      // Step 1: Navigate to Results page and verify flood zone Header
      await browser.url(`${browser.options.baseUrl}/results?polygon=${polygon}`)

      // Step 2: Verify Surface water -> Climate chnage section is displayed
      await floodZoneResultsPage.verifySurfaceWaterClimateChangeSection()

      // step 3 : Verify Surface water -> Present day section is displayed
      await floodZoneResultsPage.verifySurfaceWaterPresentDaySection(probability)
    })
  })

  nextStepsTests.forEach(([polygon, expectedFloodZone, OptedIn, description]) => {
    it(`Validate Next Steps Section Data in Results Page Information for ${description}`, async () => {
    // Step 1: Navigate to Results page and verify flood zone Header
      await browser.url(`${browser.options.baseUrl}/results?polygon=${polygon}`)
      await expect(browser).toHaveTitle('This location is in flood zone ' + expectedFloodZone + ' - Flood map for planning - GOV.UK') // Update with your actual Flood Map Results page title
      const floodZoneResultsPageHeader = await floodZoneResultsPage.getPageTitle()
      await console.log('Flood Zone Results Page Header: ', floodZoneResultsPageHeader)
      await expect(floodZoneResultsPageHeader).toContain('This location is in flood zone ' + expectedFloodZone)

      // Step 2: Verify Next Steps Section

      await floodZoneResultsPage.verifyNextStepsSection(OptedIn, expectedFloodZone)
    })

    it(`Verify all the links in Results Page for  ${description}`, async () => {
    // Step 1: Navigate to Results page and verify flood zone Header
      await browser.url(`${browser.options.baseUrl}/results?polygon=${polygon}`)
      await expect(browser).toHaveTitle('This location is in flood zone ' + expectedFloodZone + ' - Flood map for planning - GOV.UK') // Update with your actual Flood Map Results page title
      const floodZoneResultsPageHeader = await floodZoneResultsPage.getPageTitle()
      await console.log('Flood Zone Results Page Header: ', floodZoneResultsPageHeader)
      await expect(floodZoneResultsPageHeader).toContain('This location is in flood zone ' + expectedFloodZone)

      // Step 2: Verify All the Links in Results Page
    })

    it(`Verify Holding Comments in Results Page for  ${description}`, async () => {
    // Step 1: Navigate to Results page and verify flood zone Header
      await browser.url(`${browser.options.baseUrl}/results?polygon=${polygon}`)

      // Step 2: Verify Holding Comments in Results Page
    })
  })
})
