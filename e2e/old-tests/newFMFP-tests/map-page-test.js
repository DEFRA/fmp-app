'use strict'
const mapPage = require('../pageObjects/NewFMFP/map.js')

describe('Map Page', function () {
  const tests = [
    ['Surface water', 'NA', '1 in 30'],
    ['Surface water', 'NA', '1 in 100'],
    ['Surface water', 'NA', '1 in 1000']
  ]

  tests.forEach(([dataset, timeframe, aep]) => {
    it(`Verify Info modal for ${dataset} with ${timeframe} timeframe and ${aep} AEP`, async () => {
      await browser.url(`${browser.options.baseUrl}/map?cz=600904,142717,15`)
      await expect(await mapPage.isfloodzone2and3OptionSelected()).toEqual(true)
      await browser.pause(5000)

      if (dataset === 'Flood zones 2 and 3') {
        // await mapPage.select_ds_floodzone2And3()
      } else if (dataset === 'River and sea with defences') {
        await mapPage.select_ds_RiverAndSeaWithDefences()
      } else if (dataset === 'River and sea without defences') {
        await mapPage.select_ds_RiverAndSeaWithoutDefences()
      } else if (dataset === 'Surface water') {
        await mapPage.select_ds_Surfacewater()
      } else if (dataset === 'None') {
        await mapPage.select_ds_None()
      }
      // await browser.pause(2000)

      // verify that timeframe section is displayed and present day timeframe is selected by default
      if (timeframe === 'Present Day') {
        await expect(await mapPage.isClimateChangeSectionDisplayed()).toEqual(true)
        await expect(await mapPage.isClimateChangePresentDayOptionSelected()).toEqual(true)
        await expect(await mapPage.isClimateChangePresentDayOptionDisplayed()).toEqual(true)
      } else if (timeframe === 'Climate change') {
        // select climate change timeframe option and verify the components are displayed
        await mapPage.select_ClimateChange_ClimateChange()
        // await browser.pause(2000)
        await expect(await mapPage.isClimateChangeOptionSelected()).toEqual(true)
      }

      // verify that map features water storage, flood defencesand main rivers options are displayed
      await expect(await mapPage.isMf_waterStorageOptionDisplayed()).toEqual(true)
      await expect(await mapPage.isMf_floodDefencesOptionDisplayed()).toEqual(true)
      await expect(await mapPage.ismf_mainRiversOptionDisplayed()).toEqual(true)

      // verify that rivers and sea support banner  and modal info is displayed
      if (dataset === 'river and sea with defences' || dataset === 'river and sea without defences') {
        await expect(await mapPage.isRiversAndSeaSupportBannerDisplayed()).toEqual(true)
        await expect(await mapPage.isMapPanelInfoModalDisplayed()).toEqual(true)
        await expect(await mapPage.getMapPanelInfoModalHeaderText()).toEqual('How to use rivers and sea data')
      }

      // verify that annual likelihood of flooding section is displayed and Rivers and sea 1 in 30 option is selected by default
      if (aep === '1 in 30') {
        await expect(await mapPage.isAnnualLikelihoodOfFloodingSectionDisplayed()).toEqual(true)
        await expect(await mapPage.isAllf_riversAndSea1In30OptionDisplayed()).toEqual(true)
        await expect(await mapPage.isAllf_riversAndSea1In30OptionSelected()).toEqual(true)
      } else if (aep === '1 in 100') {
        // select 1 in 100 option and verify the components are displayed
        await mapPage.select_Allf_riversAndSea1In100()
        await browser.pause(2000)
        const res100 = await mapPage.isAllf_riversAndSea1In100OptionSelected()
        console.log('isAllf_riversAndSea1In100OptionSelected: ', res100)
        await expect(await mapPage.isAllf_riversAndSea1In100OptionSelected()).toEqual(true)
      } else if (aep === '1 in 1000') {
        // select 1 in 1000 option and verify the components are displayed
        await mapPage.select_Allf_riversAndSea1In1000()
        await browser.pause(2000)
        const res1000 = await mapPage.isAllf_riversAndSea1In1000OptionSelected()
        console.log('isAllf_riversAndSea1In1000OptionSelected: ', res1000)
        await expect(await mapPage.isAllf_riversAndSea1In1000OptionSelected()).toEqual(true)
      }
      await mapPage.clickOnMapPoint(120, 70)
      await browser.pause(2000)

      if (dataset === 'Surface water') {
        await mapPage.clickOnMapPoint(10, 100)
        if (aep === '1 in 100') {
          await mapPage.clickOnMapPoint(35, 100)
        } else if (aep === '1 in 1000') {
          await mapPage.clickOnMapPoint(45, 150)
        }
      } else if (dataset === 'River and sea with defences' || dataset === 'River and sea without defences') {
        if (aep === '1 in 30') {
          await mapPage.clickOnMapPoint(120, 30)
        } else if (aep === '1 in 100') {
          await mapPage.clickOnMapPoint(120, 30)
        } else {
          await mapPage.clickOnMapPoint(120, 30)
        }
      }

      await browser.pause(2000)

      // verify easting and northing labela and value is displayed in modal
      await expect(await mapPage.iseastinglabelDisplayed()).toEqual(true)
      await expect(await mapPage.iseastingvalueDisplayed()).toEqual(true)

      // verify that time frame text is displayed
      await expect(await mapPage.istimeframelabelDisplayed()).toEqual(true)
      await expect(await mapPage.istimeframevalueDisplayed()).toEqual(true)

      if (timeframe === 'Present Day') {
        // verify that time frame text should be present day
        await expect(await mapPage.getTimeFrameValue()).toEqual('Present day')
      } else if (timeframe === 'Climate change') {
        // verify that time frame text should be climate change
        await expect(await mapPage.getTimeFrameValue()).toEqual('Climate change')
      }

      // Verify flood zone for Flood zones 2 and 3
      // Verify dataset for Rivers and Sea with defences and Rivers and Sea without defences
      if (dataset === 'Flood zones 2 and 3') {
        // verify that flood zone text is displayed
        await expect(await mapPage.isfloodzonelabelDisplayed()).toEqual(true)
        await expect(await mapPage.isfloodzonevalueDisplayed()).toEqual(true)
      } else if (dataset === 'River and sea with defences' || dataset === 'River and sea without defences' || dataset === 'Surface water') {
        // verify that Data set text is displayed
        await expect(await mapPage.isdatasetlabelDisplayed()).toEqual(true)
        await expect(await mapPage.isdatasetvalueDisplayed()).toEqual(true)
      } else {
        // verify that data set and flood zone are not displayed
        await expect(await mapPage.isdatasetlabelDisplayed()).toEqual(false)
        await expect(await mapPage.isfloodzonelabelDisplayed()).toEqual(false)
      }

      // Verify dataset value for Rivers and Sea with defences, Rivers and Sea without defences and Surface water
      if (dataset === 'River and sea with defences') {
        // verify that data set text should be River and sea with defences
        await expect(await mapPage.getDatasetValue()).toEqual('River and sea with defences')
      } else if (dataset === 'River and sea without defences') {
        // verify that data set text should be River and sea without defences
        await expect(await mapPage.getDatasetValue()).toEqual('River and sea without defences')
      } else if (dataset === 'Surface water') {
        // verify that data set text should be Surface water
        await expect(await mapPage.getDatasetValue()).toEqual('Surface water')
      }

      // Verify flood source for Flood zones 2 and 3
      // Verify AEP for Rivers and Sea with defences and Rivers and Sea without defences
      if (dataset === 'Flood zones 2 and 3') {
        // verify that flood source text is displayed
        await expect(await mapPage.isfloodsourcelabelDisplayed()).toEqual(true)
        await expect(await mapPage.isfloodsourcevalueDisplayed()).toEqual(true)
      } else if (dataset === 'River and sea with defences' || dataset === 'River and sea without defences') {
        // verify that flood source text is not displayed
        await expect(await mapPage.isfloodsourcelabelDisplayed()).toEqual(false)
        await expect(await mapPage.isfloodsourcevalueDisplayed()).toEqual(false)

        // verify that Annual Exceedence propability text is displayed
        await expect(await mapPage.isAEPlabelDisplayed()).toEqual(true)
        await expect(await mapPage.isAEPvalueDisplayed()).toEqual(true)
      } else if (dataset === 'surface water') {
        // verify that Annual Exceedence propability text is displayed
        await expect(await mapPage.isAEPlabelDisplayed()).toEqual(true)
        await expect(await mapPage.isAEPvalueSurfaceWaterDisplayed()).toEqual(true)
      } else if (dataset === 'None') {
        // verify that flood source text is not displayed
        await expect(await mapPage.isfloodsourcelabelDisplayed()).toEqual(false)
        await expect(await mapPage.isAEPlabelDisplayed()).toEqual(false)
      }

      // Verify AEP for Rivers and Sea with defences and Rivers and Sea without defences
      if (dataset === 'River and sea with defences' || dataset === 'River and sea without defences') {
        const aepValue = await mapPage.getAEPValue()
        await console.log('AEP value: ', aepValue)
        if (aep === 'Rivers and sea 1 in 30') {
          // verify that Annual Exceedence propability text should be "3.3% (1 in 30) \n chance of flooding each year"
          await expect(aepValue).toContain('3.3% (1 in 30)')
          await expect(aepValue).toContain('chance of flooding each year')
        } else if (aep === 'Rivers and sea 1 in 100') {
          // verify that Annual Exceedence propability text should be "Rivers 1% (1 in 100) \n Sea 0.5% (1 in 200) \n chance of flooding each year"
          await expect(aepValue).toContain('Rivers 1% (1 in 100)')
          await expect(aepValue).toContain('Sea 0.5% (1 in 200)')
          await expect(aepValue).toContain('chance of flooding each year')
        } else if (aep === 'Rivers and sea 1 in 1000') {
          // verify that Annual Exceedence propability text should be "0.1% (1 in 1000) \n chance of flooding each year"
          await expect(aepValue).toContain('0.1% (1 in 1000)')
          await expect(aepValue).toContain('chance of flooding each year')
        }
      }

      // Verify AEP for Surface water
      if (dataset === 'Surface water') {
        const swAepValue = await mapPage.getAEPValueSurfaceWater()
        await console.log('Surface water AEP value: ', swAepValue)
        if (aep === '1 in 30') {
          // verify that Annual Exceedence propability text should be "3.3% (1 in 30) \n chance of flooding each year"
          await expect(swAepValue).toContain('3.3% (1 in 30)')
          await expect(swAepValue).toContain('chance of flooding each year')
        } else if (aep === '1 in 100') {
          // verify that Annual Exceedence propability text should be "Rivers 1% (1 in 100) \n Sea 0.5% (1 in 200) \n chance of flooding each year"
          await expect(swAepValue).toContain('1% (1 in 100)')
          await expect(swAepValue).toContain('chance of flooding each year')
        } else if (aep === '1 in 1000') {
          // verify that Annual Exceedence propability text should be "0.1% (1 in 1000) \n chance of flooding each year"
          await expect(swAepValue).toContain('0.1% (1 in 1000)')
          await expect(swAepValue).toContain('chance of flooding each year')
        }
      }

      // Verify that Climate change Allowances header and text is displayed for Climate change timeframe
      if (timeframe === 'Climate change') {
        await expect(await mapPage.isClimateChangeAllowancesHeaderDisplayed()).toEqual(true)
        await mapPage.isClimateChangeAllowancesText_Displayed()
      }

      await console.log(`Verifying all the components in Map page info panel for ${dataset} with ${timeframe} timeframe and ${aep} AEP completed`)
    })
  })

  // this should be fixed
  it('Verify that climate change allowances link is navigating successfully ', async () => {
    // THIS TEST CASE IS TO VERIFY THAT THIS SECTION IS DISPLAYED IN MODAL
    await browser.url(`${browser.options.baseUrl}/map?cz=600904,142717,15`)
    // verify that flood zone 2 and 3 is selected
    await browser.pause(2000)
    await expect(await mapPage.isfloodzone2and3OptionSelected()).toEqual(true)
    // select climate change 2070 to 2125

    // verify that Climate change section is displayed and present day timeframe is selected by default
    // select climate change 2070 to 2125
    await expect(await mapPage.isClimateChangeSectionDisplayed()).toEqual(true)
    await expect(await mapPage.isClimateChangePresentDayOptionSelected()).toEqual(true)
    await expect(await mapPage.isClimateChangePresentDayOptionDisplayed()).toEqual(true)

    // select climate change option and verify the components are displayed
    await mapPage.select_ClimateChange_ClimateChange()
    await browser.pause(2000)
    await expect(await mapPage.isClimateChangeOptionSelected()).toEqual(true)

    // click on map point
    await mapPage.clickOnMapPoint(120, 70)
    await browser.pause(2000)

    // verify that easting and northing labela and value is displayed in modal
    await expect(await mapPage.iseastinglabelDisplayed()).toEqual(true)
    await expect(await mapPage.iseastingvalueDisplayed()).toEqual(true)

    // verify that climate change allowances header and text is displayed
    await expect(await mapPage.isClimateChangeAllowancesHeaderDisplayed()).toEqual(true)
    mapPage.isClimateChangeAllowancesText_Displayed()
    await mapPage.clickOnClimateChangeAllowanceLink()

    // verify that "Flood risk assessments: climate change allowances - GOV.UK" page is displayed
    await expect(browser).toHaveUrlContaining('flood-risk-assessments-climate-change-allowances')
    await expect(browser).toHaveTitle('Flood risk assessments: climate change allowances - GOV.UK')

    await console.log('Verifying all the components in Map page completed')
  })
})
