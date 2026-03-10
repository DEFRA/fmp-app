'use strict'

class Map {
  // LOCATORS
  // get pageTitle () { return $("//h1[@class='govuk-fieldset__heading']"); }
  get addbutton () { return $("//span[text()='Add']/..") }
  get mapView () { return $("//div[@id='map-viewport']") }
  get editShapeButton () { return $("//button[text()='Edit shape']") }
  get confirmAreaButton () { return $("//button[text()='Confirm']") }
  get cancelbutton () { return $("//button[text()='Cancel']") }
  get editbutton () { return $("//span[text()='Edit']/..") }
  get deletebutton () { return $("//span[text()='Delete']/..") }
  get getSummaryReportButton () { return $("//button[text()='Get summary report']") }
  get updateAreaButton () { return $("//button[text()='Update']") }
  get cancelButton () { return $("//button[text()='Cancel']") }
  get searchbutton () { return $("//button//span[text()='Search']/..") }
  get keybutton () { return $("//button/span[text()='Key']/..") }
  get keyLayers () { return $("//*[@id='map-panel-key']") }
  get keyFlood2Layer () { return $("//div[@id='map-panel-key']//span[text()='Flood zone 2']") }
  get keyFlood3Layer () { return $("//div[@id='map-panel-key']//span[text()='Flood zone 3']") }
  get keyWaterStorageLayer () { return $("//div[@id='map-panel-key']//span[text()='Water storage']") }
  get keyFloodDefenceLayer () { return $("//div[@id='map-panel-key']//span[text()='Flood defence']") }
  get keyMainRiversLayer () { return $("//div[@id='map-panel-key']//span[text()='Main Rivers']") }
  get keyNofeaturesText () { return $("//*[@id='map-panel-key']//p[text()='No features displayed']") }
  get darkModeButton () { return $("//button[@aria-labelledby='map-style-label']") }
  get zoomInButton () { return $("//button[contains(@class,'zoom-in')]") }
  get zoomOutButton () { return $("//button[contains(@class,'zoom-out')]") }
  get copyrightLink () { return $("//a[text()=' Contains OS data © Crown copyright and database rights 2025 ']") }
  get key () { return $("//*[@id='map-panel-key']") }

  // datasets -ds
  get dsHeader () { return $("//h3[text()='Datasets']") }
  get dsFloodzone2And3 () { return $("//input[@id='fz']/..") }
  get dsFloodzone2And3Option () { return $("//input[@id='fz']/../input") }
  get dsRiversAndSeaWithDefences () { return $("//input[@id='rsd']/..") }
  get dsRiversAndSeaWithDefencesOption () { return $("//input[@id='rsd']/../input") }
  get dsRiversAndSeaWithoutDefences () { return $("//input[@id='rsu']/..") }
  get dsRiversAndSeaWithoutDefencesOption () { return $("//input[@id='rsu']/../input") }
  get dsSurfwater () { return $("//input[@id='sw']/..") }
  get dsSurfwaterOption () { return $("//input[@id='sw']/../input") }
  get dsNone () { return $("//input[@id='mo']/../label") }
  get dsNoneOption () { return $("//*[@id='mo']") }

  // Climate change -cc
  get ccHeader () { return $("//h3[text()='Climate change']") }
  get ccPresentDay () { return $("//input[@id='fzpd']/..") }
  get ccPresentDayOption () { return $("//input[@id='fzpd']/../input") }
  get ccClimateeChange () { return $("//input[@id='fzcl']/..") }
  get ccClimateeChangeOption () { return $("//input[@id='fzcl']/../input") }

  // Annual likelihood of flooding - allf
  get allfHeader () { return $("//h3[text()='Annual likelihood of flooding']") }
  // get allfRiversAndSea1In30 () { return $("//input[@id='hr']/../label") }
  get allfRiversAndSea1In30 () { return $("//input[@id='hr']/..") }
  get allfRiversAndSea1In30Option () { return $("//input[@id='hr']/../input") }
  // get allfRiversAndSea1In100 () { return $("//input[@id='mr']/../label") }
  get allfRiversAndSea1In100 () { return $("//input[@id='mr']/../label") }
  get allfRiversAndSea1In100Option () { return $("//input[@id='mr']/../input") }
  // get allfRiversAndSea1In1000 () { return $("//input[@id='lr']") }
  get allfRiversAndSea1In1000 () { return $("//input[@id='lr']/../label") }
  get allfRiversAndSea1In1000Option () { return $("//input[@id='lr']/../input") }

  // mapfeatures - mf
  get mfWaterStorage () { return $("//button[@value='fsa']") }
  get mfFloodDefences () { return $("//button[@value='fd']") }
  get mfMainRivers () { return $("//button[@value='mainr']") }

  // New Rivers and sea updates
  get riversAndSeaSupportBanner () { return $("//div[@id='rivers-and-seas-banner']") }
  get riversAndSeaSupportWarningText () { return $("//strong[@class='govuk-warning-text__text']") }
  get riversAndSeaSupportLink () { return $("//span[@class='govuk-warning-text__link']") }

  // How to use Rivers and sea data Modal Info
  get riversAndSeaDisclaimer () { return $("//div[@id='map-panel-info']//p[@id='rivers-and-seas-disclaimer-panel']") }
  get riversAndSeaLinkText () { return $("//div[@id='map-panel-info']//a[text()='Find out more about this data and how it should be used.']") }
  get riversAndSeaBodyText1 () { return $("//div[@id='map-panel-info']//p[text()=' In some locations the rivers and sea supporting data may show inconsistent results. ']") }
  get riversAndSeaBodyText2 () { return $("//div[@id='map-panel-info']//p[text()=' The flood zones are not affected by this issue. ']") }

  // Map panel Information
  get mapPanelInfoModal () { return $("//div[@id='map-panel-info']") }
  get mapPanelInfoModalHeader () { return $("//h2[@id='map-panel-info-label']") }
  get eastinglabel () { return $("//dt/span/strong[text()='Easting and northing']") }
  get eastingvalue () { return $("//strong[text()='Easting and northing']/../../../dd/span") }
  get timeframelabel () { return $("//dt/span/strong[text()='Timeframe']") }
  get timeframevalue () { return $("//strong[text()='Timeframe']/../../../dd/span") }
  get floodzonelabel () { return $("//dt/span/strong[text()='Flood zone']") }
  get floodzonevalue () { return $("//strong[text()='Flood zone']/../../../dd/span") }
  get floodsourcelabel () { return $("//dt/span/strong[text()='Flood source']") }
  get floodsourcesvalue () { return $("//strong[text()='Flood source']/../../../dd/span") }
  get updatesToFloodZonesHeader () { return $("//div[@id='map-panel-info']//h2[text()='Updates to flood zones 2 and 3']") }
  get updatesToFloodZonesText () { return $("//div[@id='map-panel-info']//p[contains(text(),'Flood zones 2 and 3 have been updated to include local detailed models, and a new improved national model.')]") }
  get datasetlabel () { return $("//dt/span/strong[text()='Dataset']") }
  get datasetvalue () { return $("//strong[text()='Dataset']/../../../dd/span") }
  get aeplabel () { return $("//dt/span/strong[text()='Annual exceedance probability (AEP)']") }
  get aepvalue () { return $("//strong[text()='Annual exceedance probability (AEP)']/../../../dd/span") }
  get aepvalueSurfacewater () { return $("//strong[text()='Annual exceedance probability (AEP)']/../../../dd/span") }

  // "How to use rivers and sea data" section in Map panel info modal
  get summaryRiversAndSeaData () { return $("//summary/span[text()='How to use rivers and sea data']") }
  get summaryRiversAndSeaDataText1 () { return $("//summary/span[text()='How to use rivers and sea data']/../../div/p[1]") }
  get summaryRiversAndSeaDataLinkText () { return $("//summary/span[text()='How to use rivers and sea data']/../../div//a") }
  get summaryRiversAndSeaDataText3 () { return $("//summary/span[text()='How to use rivers and sea data']/../../div/p[3]") }
  get summaryRiversAndSeaDataText4 () { return $("//summary/span[text()='How to use rivers and sea data']/../../div/p[4]") }

  // "3.3.% (1 in 30) and flood zone 3b" section in Map panel info modal
  get summary1In30Data () { return $("//summary/span[text()='3.3% (1 in 30) and flood zone 3b']") }
  get summary1In30DataText () { return $("//summary/span[text()='3.3% (1 in 30) and flood zone 3b']/../../div") }

  // "Climate change allowances" section in Map panel info modal
  get climateChangeAllowancesheader () { return $("//h2[text()='Climate change allowances']") }
  get climateChangeAllowancesText1 () { return $("//h2[text()='Climate change allowances']/following-sibling::ul/li[1]") }
  get climateChangeAllowancesText1Link () { return $("//h2[text()='Climate change allowances']/following-sibling::ul/li[1]/a") }
  get climateChangeAllowancesText2 () { return $("//h2[text()='Climate change allowances']/following-sibling::ul/li[2]") }
  get climateChangeAllowancesText3 () { return $("//h2[text()='Climate change allowances']/following-sibling::ul/li[3]") }
  get climateChangeAllowanceLink () { return $("//ul/li[1]/a[contains(text(),'Flood risk assessment: climate change allowances')]") }

  // Page functions
  async getPageTitle () {
    const element = await this.pageTitle
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  async select_ds_floodzone2And3 () {
    return await (await this.dsFloodzone2And3).click()
  }

  async select_ds_RiverAndSeaWithDefences () {
    return await (await this.dsRiversAndSeaWithDefences).click()
  }

  async select_ds_RiverAndSeaWithoutDefences () {
    return await (await this.dsRiversAndSeaWithoutDefences).click()
  }

  async select_ds_Surfacewater () {
    return await (await this.dsSurfwater).click()
  }

  async select_ds_None () {
    return await (await this.dsNone).click()
  }

  async select_ClimateChange_PresentDay () {
    return await (await this.ccPresentDay).click()
  }

  async select_ClimateChange_ClimateChange () {
    return await (await this.ccClimateeChange).click()
  }

  async select_mf_waterStorage () {
    return await (await this.mfWaterStorage).click()
  }

  async select_mf_floodDefences () {
    return await (await this.mfFloodDefences).click()
  }

  async select_mf_mainRivers () {
    return await (await this.mfMainRivers).click()
  }

  async isds_floodzone2And3OptionDisplayed () {
    const element = await this.dsFloodzone2And3
    return await element.isDisplayed()
  }

  async isds_riversAndSeaWithDefencesOptionDisplayed () {
    const element = await this.dsRiversAndSeaWithDefences
    return await element.isDisplayed()
  }

  async isds_riversAndSeaWithoutDefencesOptionDisplayed () {
    const element = await this.dsRiversAndSeaWithoutDefences
    return await element.isDisplayed()
  }

  async isds_surfwaterOptionDisplayed () {
    const element = await this.dsSurfwater
    return await element.isDisplayed()
  }

  async isds_noneOptionDisplayed () {
    const element = await this.dsNone
    return await element.isDisplayed()
  }

  async isClimateChangePresentDayOptionDisplayed () {
    const element = await this.ccPresentDay
    return await element.isDisplayed()
  }

  async isClimateChangeOptionDisplayed () {
    const element = await this.ccClimateeChange
    return await element.isDisplayed()
  }

  async isAllf_riversAndSea1In30OptionDisplayed () {
    const element = await this.allfRiversAndSea1In30
    return await element.isDisplayed()
  }

  async isAllf_riversAndSea1In100OptionDisplayed () {
    const element = await this.allfRiversAndSea1In100
    return await element.isDisplayed()
  }

  async isAllf_riversAndSea1In1000OptionDisplayed () {
    const element = await this.allfRiversAndSea1In1000
    return await element.isDisplayed()
  }

  async isMf_waterStorageOptionDisplayed () {
    const element = await this.mfWaterStorage
    return await element.isDisplayed()
  }

  async isMf_floodDefencesOptionDisplayed () {
    const element = await this.mfFloodDefences
    return await element.isDisplayed()
  }

  async ismf_mainRiversOptionDisplayed () {
    const element = await this.mfMainRivers
    return await element.isDisplayed()
  }

  async isSearchButtonDisplayed () {
    const element = await this.searchbutton
    return await element.isDisplayed()
  }

  async isKeyButtonDisplayed () {
    const element = await this.keybutton
    return await element.isDisplayed()
  }

  async isKeyLayersModelDisplayed () {
    const element = await this.keyLayers
    return await element.isDisplayed()
  }

  // method to check if the key layer for flood zone 2 is displayed
  async isKeyLayerForFloodZone_2_Displayed () {
    const element = await this.keyFlood2Layer
    return await element.isDisplayed()
  }

  // method to check if the key layer for flood zone 3 is displayed
  async isKeyLayerForFloodZone_3_Displayed () {
    const element = await this.keyFlood3Layer
    return await element.isDisplayed()
  }

  // method to check if the key layer for water storage is displayed
  async isKeyLayerForWaterStorage_Displayed () {
    const element = await this.keyWaterStorageLayer
    return await element.isDisplayed()
  }

  // method to check if the key layer for flood defences is displayed
  async isKeyLayerForFloodDefences_Displayed () {
    const element = await this.keyFloodDefenceLayer
    return await element.isDisplayed()
  }

  // method to check if the key layer for main rivers is displayed
  async isKeyLayerForMainRivers_Displayed () {
    const element = await this.keyMainRiversLayer
    return await element.isDisplayed()
  }

  // method to check if the key layer for no features is displayed
  async isKeyLayerForNoFeatures_Displayed () {
    const element = await this.keyNofeaturesText
    return await element.isDisplayed()
  }

  async isDarkModeButtonDisplayed () {
    const element = await this.darkModeButton
    return await element.isDisplayed()
  }

  async isZoomInBtnDisplayed () {
    const element = await this.zoomInButton
    return await element.isDisplayed()
  }

  async isZoomOutBtnDisplayed () {
    const element = await this.zoomOutButton
    return await element.isDisplayed()
  }

  async isCopyRightLinkDisplayed () {
    const element = await this.copyrightLink
    return await element.isDisplayed()
  }

  async isfloodzone2and3OptionSelected () {
    const element = await this.dsFloodzone2And3Option
    return await element.isSelected()
  }

  async isRiversAndSeaWithDefencesOptionSelected () {
    const element = await this.dsRiversAndSeaWithDefencesOption
    return await element.isSelected()
  }

  async isRiversAndSeaWithoutDefencesOptionSelected () {
    const element = await this.dsRiversAndSeaWithoutDefencesOption
    return await element.isSelected()
  }

  async isSurfaceWaterOptionSelected () {
    const element = await this.dsSurfwaterOption
    return await element.isSelected()
  }

  async isNoneOptionSelected () {
    const element = await this.dsNoneOption
    return await element.isSelected()
  }

  // verify that rivers and sea support banner is displayed
  async isRiversAndSeaSupportBannerDisplayed () {
    const element = await this.riversAndSeaSupportBanner
    return await element.isDisplayed()
  }

  // verify that rivers and sea support banner with link is displayed
  async isRiversAndSeaSupportBannerWithLinkDisplayed () {
    const element = await this.riversAndSeaSupportLink
    return await element.isDisplayed()
  }

  // function to click on rivers and sea support link
  async clickOnRiversAndSeaSupportLink () {
    const element = await this.riversAndSeaSupportLink
    await element.click()
  }

  // verify that map info panel is displayed
  async isMapPanelInfoModalDisplayed () {
    const element = await this.mapPanelInfoModal
    return await element.isDisplayed()
  }

  // verify that map info panel header is displayed
  async isMapPanelInfoModalHeaderDisplayed () {
    const element = await this.mapPanelInfoModalHeader
    return await element.isDisplayed()
  }

  // get header text from map panel info modal
  async getMapPanelInfoModalHeaderText () {
    const element = await this.mapPanelInfoModalHeader
    return await element.getText()
  }

  async isClimateChangeSectionDisplayed () {
    const element = await this.ccHeader
    return await element.isDisplayed()
  }

  async isAnnualLikelihoodOfFloodingSectionDisplayed () {
    const element = await this.allfHeader
    return await element.isDisplayed()
  }

  async isClimateChangePresentDayOptionSelected () {
    const element = await this.ccPresentDayOption
    return await element.isSelected()
  }

  async isClimateChangeOptionSelected () {
    const element = await this.ccClimateeChangeOption
    return await element.isSelected()
  }

  async isAllf_riversAndSea1In30OptionSelected () {
    const element = await this.allfRiversAndSea1In30Option
    return await element.isSelected()
  }

  async isAllf_riversAndSea1In100OptionSelected () {
    const element = await this.allfRiversAndSea1In100Option
    return await element.isSelected()
  }

  async isAllf_riversAndSea1In1000OptionSelected () {
    const element = await this.allfRiversAndSea1In1000Option
    return await element.isSelected()
  }

  async clickOnMapPoint (inputx, inputy) {
    const element = await this.mapView
    await expect(await element.isDisplayed()).toEqual(true)
    await element.click({ x: inputx, y: inputy })
  }

  async iseastinglabelDisplayed () {
    const element = await this.eastinglabel
    return await element.isDisplayed()
  }

  async iseastingvalueDisplayed () {
    const element = await this.eastingvalue
    await element.waitForExist({ timeout: 5000 })
    return await element.isDisplayed()
  }

  async getEastingValue () {
    const element = await this.eastingvalue
    return await element.getText()
  }

  async istimeframelabelDisplayed () {
    const element = await this.timeframelabel
    return await element.isDisplayed()
  }

  async istimeframevalueDisplayed () {
    const element = await this.timeframevalue
    return await element.isDisplayed()
  }

  async getTimeFrameValue () {
    const element = await this.timeframevalue
    return await element.getText()
  }

  async isfloodzonelabelDisplayed () {
    const element = await this.floodzonelabel
    return await element.isDisplayed()
  }

  async isfloodzonevalueDisplayed () {
    const element = await this.floodzonevalue
    return await element.isDisplayed()
  }

  async getFloodZoneValue () {
    const element = await this.floodzonevalue
    return await element.getText()
  }

  async isfloodsourcelabelDisplayed () {
    const element = await this.floodsourcelabel
    return await element.isDisplayed()
  }

  async isfloodsourcevalueDisplayed () {
    const element = await this.floodsourcesvalue
    return await element.isDisplayed()
  }

  async getFloodSourceValue () {
    const element = await this.floodsourcesvalue
    return await element.getText()
  }

  async isupdatesToFloodZonesHeaderDisplayed () {
    const element = await this.updatesToFloodZonesHeader
    return await element.isDisplayed()
  }

  async isupdatesToFloodZonesTextDisplayed () {
    const element = await this.updatesToFloodZonesText
    return await element.isDisplayed()
  }

  async isdatasetlabelDisplayed () {
    const element = await this.datasetlabel
    return await element.isDisplayed()
  }

  async isdatasetvalueDisplayed () {
    const element = await this.datasetvalue
    return await element.isDisplayed()
  }

  async getDatasetValue () {
    const element = await this.datasetvalue
    return await element.getText()
  }

  async isAEPlabelDisplayed () {
    const element = await this.aeplabel
    return await element.isDisplayed()
  }

  async isAEPvalueDisplayed () {
    const element = await this.aepvalue
    return await element.isDisplayed()
  }

  async isAEPvalueSurfaceWaterDisplayed () {
    const element = await this.aepvalueSurfacewater
    return await element.isDisplayed()
  }

  async getAEPValue () {
    const element = await this.aepvalue
    return await element.getText()
  }

  async getAEPValueSurfaceWater () {
    const element = await this.aepvalueSurfacewater
    return await element.getText()
  }

  async select_Allf_riversAndSea1In100 () {
    const elem = await this.allfRiversAndSea1In100
    await elem.scrollIntoView()
    return await elem.click()
  }

  async select_Allf_riversAndSea1In1000 () {
    const elem = await this.allfRiversAndSea1In1000
    await elem.scrollIntoView()
    return await elem.click()
  }

  // function to check climate change allowances header is displayed
  async isClimateChangeAllowancesHeaderDisplayed () {
    const element = await this.climateChangeAllowancesheader
    return await element.isDisplayed()
  }

  // function to check climate change allowances text 1 is displayed
  async isClimateChangeAllowancesText_1_Displayed () {
    const element = await this.climateChangeAllowancesText1
    const elementText = await element.getText()
    const expText = "these have been taken from the Environment Agency's Flood risk assessment: climate change allowances"
    console.log('Climate Change Allowances Text 1:', elementText)
    return await expect(elementText).toContain(expText)
  }

  // function to check climate change allowances text 2 is displayed
  async isClimateChangeAllowancesText_2_Displayed () {
    const element = await this.climateChangeAllowancesText2
    const elementText = await element.getText()
    const expText = "river flooding uses the 'central' allowance, based on the 50th percentile for the 2080s epoch"
    console.log('Climate Change Allowances Text 2:', elementText)
    return await expect(elementText).toEqual(expText)
  }

  // function to check climate change allowances text 3 is displayed
  async isClimateChangeAllowancesText_3_Displayed () {
    const element = await this.climateChangeAllowancesText3
    const elementText = await element.getText()
    const expText = "sea and tidal flooding uses the 'upper end' allowance, based on the 95th percentile for 2125"
    console.log('Climate Change Allowances Text 3:', elementText)
    return await expect(elementText).toEqual(expText)
  }

  // function to check climate change allowances link is displayed
  async isClimateChangeAllowanceLink_Displayed () {
    const element = await this.climateChangeAllowanceLink
    return await element.isDisplayed()
  }

  // function to check climate change allowances text 1,2 and 3 is displayed
  async isClimateChangeAllowancesText_Displayed () {
    await this.isClimateChangeAllowancesText_1_Displayed()
    await this.isClimateChangeAllowancesText_2_Displayed()
    await this.isClimateChangeAllowancesText_3_Displayed()
    await this.isClimateChangeAllowancesHeaderDisplayed()
  }

  // function to click on climate change allowances link
  async clickOnClimateChangeAllowanceLink () {
    const element = await this.climateChangeAllowancesText1Link
    await element.click()
  }

  // function to check rivers and sea disclaimer is displayed
  async isRiversAndSeaDisclaimerDisplayed () {
    const element = await this.riversAndSeaDisclaimer
    return await element.isDisplayed()
  }

  // function to check rivers and sea link text is displayed
  async isRiversAndSeaLinkTextDisplayed () {
    const element = await this.riversAndSeaLinkText
    return await element.isDisplayed()
  }

  // function to click on rivers and sea link text
  async clickOnRiversAndSeaLinkText () {
    const element = await this.riversAndSeaLinkText
    await element.click()
  }

  // function to check rivers and sea body text 1 is displayed
  async isRiversAndSeaBodyText_1_Displayed () {
    const element = await this.riversAndSeaBodyText1
    return await element.isDisplayed()
  }

  // function to check rivers and sea body text 2 is displayed
  async isRiversAndSeaBodyText_2_Displayed () {
    const element = await this.riversAndSeaBodyText2
    return await element.isDisplayed()
  }

  // function to check rivers and sea disclaimer, body text 1,2 and link is displayed
  async isRiversAndSeaBodyText_Displayed () {
    await expect(await this.isRiversAndSeaDisclaimerDisplayed()).toEqual(true)
    await expect(await this.isRiversAndSeaBodyText_1_Displayed()).toEqual(true)
    await expect(await this.isRiversAndSeaBodyText_2_Displayed()).toEqual(true)
    await expect(await this.isRiversAndSeaLinkTextDisplayed()).toEqual(true)
  }

  // function to check summary rivers and sea data is displayed in Map panel info modal
  async isSummary_riversAndSeaData_Displayed () {
    const element = await this.summaryRiversAndSeaData
    return await element.isDisplayed()
  }

  // function to click on summary rivers and sea data
  async clickOnSummary_riversAndSeaData () {
    const element = await this.summaryRiversAndSeaData
    await element.click()
  }

  // function to check summary rivers and sea data text 1 is displayed
  async isSummary_riversAndSeaDataText_1_Displayed () {
    const element = await this.summaryRiversAndSeaDataText1
    return await element.isDisplayed()
  }

  async getSummary_riversAndSeaDataText_1 () {
    const element = await this.summaryRiversAndSeaDataText1
    return await element.getText()
  }

  // function to check summary rivers and sea data link text is displayed
  async isSummary_riversAndSeaDataLinkText_Displayed () {
    const element = await this.summaryRiversAndSeaDataLinkText
    return await element.isDisplayed()
  }

  async getSummary_riversAndSeaDataLinkText () {
    const element = await this.summaryRiversAndSeaDataLinkText
    return await element.getText()
  }

  // function to check summary rivers and sea data text 3 is displayed
  async isSummary_riversAndSeaDataText_3_Displayed () {
    const element = await this.summaryRiversAndSeaDataText3
    return await element.isDisplayed()
  }

  async getSummary_riversAndSeaDataText_3 () {
    const element = await this.summaryRiversAndSeaDataText3
    return await element.getText()
  }

  // function to check summary rivers and sea data text 4 is displayed
  async isSummary_riversAndSeaDataText_4_Displayed () {
    const element = await this.summaryRiversAndSeaDataText4
    return await element.isDisplayed()
  }

  async getSummary_riversAndSeaDataText_4 () {
    const element = await this.summaryRiversAndSeaDataText4
    return await element.getText()
  }

  // function to check summary rivers and sea data text 1,3 and 4 is displayed
  async isSummary_riversAndSeaDataText_Displayed () {
    await expect(await this.isSummary_riversAndSeaDataText_1_Displayed()).toEqual(true)
    await expect(await this.isSummary_riversAndSeaDataLinkText_Displayed()).toEqual(true)
    await expect(await this.isSummary_riversAndSeaDataText_3_Displayed()).toEqual(true)
    await expect(await this.isSummary_riversAndSeaDataText_4_Displayed()).toEqual(true)
  }

  // function to click on summary rivers and sea data link text
  async clickOnSummary_riversAndSeaDataLinkText () {
    const element = await this.summaryRiversAndSeaDataLinkText
    await element.click()
  }

  // function to check summary 1 in 30 data is displayed in Map panel info modal
  async isSummary_1In30Data_Displayed () {
    const element = await this.summary1In30Data
    return await element.isDisplayed()
  }

  // function to click on summary 1 in 30 data
  async clickOnSummary_1In30Data () {
    const element = await this.summary1In30Data
    await element.click()
  }

  // function to check summary 1 in 30 data text is displayed
  async isSummary_1In30DataText_Displayed () {
    const element = await this.summary1In30DataText
    return await element.isDisplayed()
  }

  // function to get summary 1 in 30 data text
  async getSummary_1In30DataText () {
    const element = await this.summary1In30DataText
    return await element.getText()
  }

  //
  // functions to verify actions like 'Add','Edit Shape','Edit', 'Delete', 'confirm area', 'cancel' and  'Get summary report' buttons are displayed
  //

  // function to verify that 'Add' button is displayed
  async isAddbuttonDisplayed () {
    const element = await this.addbutton
    return await element.isDisplayed()
  }

  // function to click on add button
  async clickOnAddButton () {
    const element = await this.addbutton
    await element.click()
  }

  // function to verify that 'Edit shape' button is displayed
  async isEditShapeButtonDisplayed () {
    const element = await this.editShapeButton
    return await element.isDisplayed()
  }

  // functio to verify that confirm area button is displayed
  async isConfirmAreaButtonDisplayed () {
    const element = await this.confirmAreaButton
    return await element.isDisplayed()
  }

  // functio to verify that cancel button is displayed
  async isCancelButtonDisplayed () {
    const element = await this.cancelbutton
    return await element.isDisplayed()
  }

  // function to click on confirm area button
  async clickOnConfirmAreaButton () {
    const element = await this.confirmAreaButton
    await element.click()
  }

  // function to verify that edit button is displayed
  async isEditButtonDisplayed () {
    const element = await this.editbutton
    return await element.isDisplayed()
  }

  // function to verify that delete button is displayed
  async isDeleteButtonDisplayed () {
    const element = await this.deletebutton
    return await element.isDisplayed()
  }

  // function to verify that get summary report button is displayed
  async isGetSummaryReportButtonDisplayed () {
    const element = await this.getSummaryReportButton
    return await element.isDisplayed()
  }

  // function to click on get summary report button
  async clickOnGetSummaryReportButton () {
    const element = await this.getSummaryReportButton
    await element.click()
  }
}
module.exports = new Map()
