'use strict'
class FloodZoneResults {
  // LOCATORS
  get pageTitle () { return $("//h1[@class='govuk-heading-xl']") }
  get swAndRandSHeader () { return $("//p[text()='In your proposed development site there is a risk of flooding from:']") }
  get RandSText () { return $("//p//following-sibling::ul/li[text()='rivers and the sea']") }
  get SWText () { return $("//p//following-sibling::ul/li[text()='surface water']") }
  get floodRiskAssessmentHeader () { return $("//h2[text()='Flood risk assessments']") }
  // fra
  // fz1 greater than 1 hectare fra
  // fz1 greater than 1 hectare area
  // fz1 less than 1 hectare fra
  get fraRequired () { return $("//p[@data-testid='fra' and text()='Based on our flood risk data, you need to carry out a flood risk assessment (FRA) as part of the planning application for this development.']") }
  get fra_FZ1_LT_1Hectare () { return $("//p[@data-testid='fz1-lt1ha-fra' and text()='Developments in flood zone 1 that are less than 1 hectare (ha) only need a flood risk assessment (FRA) where:']") }
  get fra_FZ1_LT_1Hectare_List_1 () { return $("//p[@data-testid='fz1-lt1ha-fra']//following-sibling::ul/li[1][text()='land has been identified as having critical drainage problems']") }
  get fra_FZ1_LT_1Hectare_List_2 () { return $("//p[@data-testid='fz1-lt1ha-fra']//following-sibling::ul/li[2]") }
  get fra_FZ1_LT_1Hectare_List_3 () { return $("//p[@data-testid='fz1-lt1ha-fra']//following-sibling::ul/li[3]") }
  get fra_FZ1_GT_1Hectare () { return $("//p[@data-testid='fz1-gt1ha-fra' and text()='Developments in flood zone 1 that are more than 1 hectare need a flood risk assessment (FRA).']") }
  get area () { return $("//p[@class='govuk-body' and contains(text(),'The site you have drawn')]") }
  get coreText_1 () { return $("//p[@class='govuk-body'][3]") }
  get residualRisk_link () { return $("//a[contains(text(),'residual')]") }
  get coreText_2 () { return $("//p[@class='govuk-body' and contains(text(),'Review the flood risks for your location then complete the next steps for your planning')]") }

  // Rivers and the sea table section
  get riversAndSeaTableHaeader () { return $("//h2[@class='govuk-summary-card__title' and contains(text(),'Rivers and the sea')]") }
  get riversAndSea_SeeThisRiskOnMap_link () { return $("//h2[contains(text(),'Rivers and the sea')]//following-sibling::ul//a[contains(text(),'See this risk on the map')]") }

  // flood zone and probability text
  get riversAndSea_FoodZoneInfo () { return $("//dt[@class='govuk-summary-list__key' and contains(text(),'What flood zone')]") }
  get riversAndSea_FloodZone_Probability () { return $("//p[contains(@data-testid,'fz')]") }
  get riversAndSea_FloodZone1_Probability () { return $("//p[contains(@data-testid,'fz1-probability')]") }
  get riversAndSea_FRARequired () { return $("//p[contains(@data-testid,'fz')]//following-sibling::p[text()='You need to carry out a flood risk assessment (FRA) as part of the planning application for this development.']") }
  get riversAndSea_FloodZoneLink () { return $("//h2[contains(text(),'Rivers and the sea')]/../..//a[contains(text(),'Find out more about flood zones and what')]") }

  // Rivers and sea climate change section
  get riversAndSeaClimateChangeHeader () { return $("//dt[@data-testid='rofrs-cc']/..//dt[contains(text(),'Climate change: projected chance of flooding')]") }

  // Rivers and sea climate change defended section
  get rAndS_CC_defendedHeader () { return $("//dt[@data-testid='rofrs-cc']//following-sibling::dd/h3[text()='With defences (defended)']") }
  get rAndS_cc_defendedPropability () { return $("//p[@data-testid='rofrs-cc-defended-probability']") }
  get rAndS_cc_defended_List1 () { return $("//p[@data-testid='rofrs-cc-defended-probability']//following-sibling::ul[1]/li[1]") }
  get rAndS_cc_defended_List2 () { return $("//p[@data-testid='rofrs-cc-defended-probability']//following-sibling::ul[1]/li[2]") }
  // Rivers and Sea Cimate Change Defended -> What does defended mean section
  get rAndS_cc_Defended_SummaryHeader () { return $("//p[@data-testid='rofrs-cc-defended-probability']//following-sibling::details[1]//span[contains(text(),'defended')]") }
  get rAndS_cc_Defended_SummaryText_1 () { return $("//p[@data-testid='rofrs-cc-defended-probability']//following-sibling::details[1]//ul/li[1]") }
  get rAndS_cc_Defended_SummaryText_2 () { return $("//p[@data-testid='rofrs-cc-defended-probability']//following-sibling::details[1]//ul/li[2]") }
  get rAndS_cc_Defended_SummaryText_3 () { return $("//p[@data-testid='rofrs-cc-defended-probability']//following-sibling::details[1]//ul/li[3]") }
  // Rivers and Sea Cimate Change Defended -> Rivers and sea data inconsistency section
  get rAndS_cc_Defended_dataInconsistencyHeader () { return $("//p[@data-testid='rofrs-cc-defended-probability']//following-sibling::details[2]//span[contains(text(),'Rivers and sea data inconsistencies')]") }
  get rAndS_cc_Defended_dataInconsistencyText () { return $("//p[@data-testid='rofrs-cc-defended-probability']//following-sibling::details[2]//div/p[contains(text(),'In some locations this data layer may show inconsistent results.')]") }
  get rAndS_cc_Defended_dataInconsistency_FindOutMoreAboutLink () { return $("//p[@data-testid='rofrs-cc-defended-probability']//following-sibling::details[2]//div/p/a[text()='Find out more about this data and how it should be used ']") }
  get rAndS_cc_Defended_dataInconsistencyText_2 () { return $("//p[@data-testid='rofrs-cc-defended-probability']//following-sibling::details[2]//div/p[contains(text(),'The flood zones are not affected by this issue.')]") }

  // Rivers and sea climate change unDefended section
  get rAndS_cc_UndefendedHeader () { return $("//h3[@data-testid='rofrs-cc-undefended' and text()='Without defences (undefended)']") }
  get rAndS_cc_UndefendedPropabilityText1 () { return $("//h3[@data-testid='rofrs-cc-undefended']//following-sibling::p[1]") }
  get rAndS_cc_UndefendedPropabilityText2 () { return $("//h3[@data-testid='rofrs-cc-undefended']//following-sibling::p[2]") }
  get rAndS_cc_Undefended_List1 () { return $("//h3[@data-testid='rofrs-cc-undefended']//following-sibling::ul/li[1]") }
  get rAndS_cc_Undefended_List2 () { return $("//h3[@data-testid='rofrs-cc-undefended']//following-sibling::ul/li[2]") }
  // Rivers and Sea Cimate Change UnDefended -> What does Undefended mean section
  get rAndS_cc_Undefended_SummaryHeader () { return $("//h3[@data-testid='rofrs-cc-undefended']//following-sibling::details//span[contains(text(), 'undefended')]") }
  get rAndS_cc_Undefended_SummaryText () { return $("//h3[@data-testid='rofrs-cc-undefended']//following-sibling::details//div//ul/li") }

  // Rivers and Sea Cimate Change UnDefended -> Rivers and sea data inconsistency section
  get rAndS_cc_Undefended_dataInconsistencyHeader () { return $("//h3[@data-testid='rofrs-cc-undefended']//following-sibling::details//span[contains(text(), 'Rivers and sea data inconsistencies')]") }
  get rAndS_cc_Undefended_dataInconsistencyText () { return $("//h3[@data-testid='rofrs-cc-undefended']//following-sibling::details//div/p[contains(text(),'In some locations this data layer may show inconsistent results.')]") }
  get rAndS_cc_Undefended_dataInconsistency_FindOutMoreAboutLink () { return $("//h3[@data-testid='rofrs-cc-undefended']//following-sibling::details//div/p/a[text()='Find out more about this data and how it should be used ']") }
  get rAndS_cc_Undefended_dataInconsistencyText_2 () { return $("//h3[@data-testid='rofrs-cc-undefended']//following-sibling::details//div/p[contains(text(),'The flood zones are not affected by this issue.')]") }

  get rAndS_cc_findOutMoreAboutCCLink () { return $("//a[@data-testid='cc-allowances'][contains(text(),'Find out more about climate change allowances.')]") }

  // Rivers and sea Present day section
  get rAndS_PresentDayHeader () { return $("//div[@data-testid='rofrs']/..//dt[contains(text(),'Present day chance of flooding')]") }

  // Rivers and sea Present day -> defended section
  get rAndS_PD_defendedHeader () { return $("//div[@data-testid='rofrs']/dd/h3[text()='With defences (defended)']") }
  get rAndS_PD_defendedPropabilityText () { return $("//h3[@data-testid='rofrs-defended']//following-sibling::p[1]") }
  get rAndS_PD_Defended_SummaryHeader () { return $("//h3[@data-testid='rofrs-defended']//following-sibling::details[1]//span[contains(text(),'defended')]") }
  get rAndS_PD_Defended_SummaryText_1 () { return $("//h3[@data-testid='rofrs-defended']//following-sibling::details[1]//ul/li[1]") }
  get rAndS_PD_Defended_SummaryText_2 () { return $("//h3[@data-testid='rofrs-defended']//following-sibling::details[1]//ul/li[2]") }
  get rAndS_PD_Defended_SummaryText_3 () { return $("//h3[@data-testid='rofrs-defended']//following-sibling::details[1]//ul/li[3]") }
  get rAndS_PD_Defended_dataInconsistencyHeader () { return $("//h3[@data-testid='rofrs-defended']//following-sibling::details[2]//span[contains(text(),'Rivers and sea data inconsistencies')]") }
  get rAndS_PD_Defended_dataInconsistencyText () { return $("//h3[@data-testid='rofrs-defended']//following-sibling::details[2]//div/p[contains(text(),'In some locations this data layer may show inconsistent results.')]") }
  get rAndS_PD_Defended_dataInconsistency_FindOutMoreAboutLink () { return $("//h3[@data-testid='rofrs-defended']//following-sibling::details[2]//div/p/a[text()='Find out more about this data and how it should be used ']") }
  get rAndS_PD_Defended_dataInconsistencyText_2 () { return $("//h3[@data-testid='rofrs-defended']//following-sibling::details[2]//div/p[contains(text(),'The flood zones are not affected by this issue.')]") }

  // Rivers and sea Present day -> undefended section
  get rAndS_PD_UndefendedHeader () { return $("//h3[@data-testid='rofrs-undefended' and text()='Without defences (undefended)']") }
  get rAndS_PD_UndefendedPropabilityText () { return $("//h3[@data-testid='rofrs-undefended']//following-sibling::p[1]") }
  get rAndS_PD_Undefended_SummaryHeader () { return $("//h3[@data-testid='rofrs-undefended']//following-sibling::details//span[contains(text(), 'undefended')]") }
  get rAndS_PD_Undefended_SummaryText () { return $("//h3[@data-testid='rofrs-undefended']//following-sibling::details//div//ul/li") }
  get rAndS_PD_Undefended_dataInconsistencyHeader () { return $("//h3[@data-testid='rofrs-undefended']//following-sibling::details//span[contains(text(), 'Rivers and sea data inconsistencies')]") }
  get rAndS_PD_Undefended_dataInconsistencyText () { return $("//h3[@data-testid='rofrs-undefended']//following-sibling::details//div/p[contains(text(),'In some locations this data layer may show inconsistent results.')]") }
  get rAndS_PD_Undefended_dataInconsistency_FindOutMoreAboutLink () { return $("//h3[@data-testid='rofrs-undefended']//following-sibling::details//div/p/a[text()='Find out more about this data and how it should be used ']") }
  get rAndS_PD_Undefended_dataInconsistencyText_2 () { return $("//h3[@data-testid='rofrs-undefended']//following-sibling::details//div/p[contains(text(),'The flood zones are not affected by this issue.')]") }

  // Surface water table section
  get surfaceWaterTableHeader () { return $("//div[@data-testid='sw']//h2[contains(text(),'Surface water for planning')]") }
  get surfaceWater_SeeThisRiskOnMap_link () { return $("//h2[contains(text(),'Surface water')]//following-sibling::ul//a[text()='See this risk on the map']") }

  // Surface water -> Climate change section
  get surfaceWaterClimateChangeHeader () { return $("//div[@data-testid='sw']//dt[contains(text(),'Climate change: projected chance of flooding')]") }
  get sw_cc_text_1 () { return $("//div[@data-testid='sw']//dt[contains(text(),'Climate change: projected chance of flooding')]//following-sibling::dd/p[1]") }
  get sw_cc_text_2 () { return $("//div[@data-testid='sw']//dt[contains(text(),'Climate change: projected chance of flooding')]//following-sibling::dd/p[2]") }
  get sw_cc_text_3 () { return $("//div[@data-testid='sw']//dt[contains(text(),'Climate change: projected chance of flooding')]//following-sibling::dd/p[3]") }
  get sw_CheckTheLongTermFloodRisk_link () { return $("//div[@data-testid='sw']//a[contains(text(),'check the long term flood risk for an area in')]") }
  get sw_HowToUseCCAllowances_link () { return $("//div[@data-testid='sw']//dd//a[contains(text(),'use climate change allowances in flood risk')]") }

  // Surface water -> Present day section
  get sw_PresentDayHeader () { return $("//div[@data-testid='sw']//dt[contains(text(),'Present day chance of flooding')]") }
  get sw_PD_text () { return $("//div[@data-testid='sw']//dd[@data-testid='sw-probability']") }

  // Next steps section
  get nextStepsHeader () { return $("//h2[@class='govuk-summary-card__title' and contains(text(),'Next steps')]") }
  get nextSteps_DecideWhatYouNeedHeader () { return $("//dt[contains(text(),'Decide what you need for your planning application')]") }
  get nextSteps_DecideWhatNeedToInclude_LinkText () { return $("//a[contains(text(),'I need help deciding what to include in my planning application.')]") }
  get nextSteps_DownloadAFloodMapHeader () { return $("//dt[contains(text(),'Download a flood map for this location')]") }
  get nextSteps_DownloadFloodMap_Text () { return $("//dt[contains(text(),'Download a flood map for this location')]/..//dd/p") }
  get nextSteps_DownloadFloodMap_Listext_1 () { return $("//dd//li[text()='in flood zone 1, 2 or 3']") }
  get nextSteps_DownloadFloodMap_Listext_2 () { return $("//dd//li[text()='within 20 metres of a main river or a flood defence']") }
  get nextSteps_DownloadFloodMap_Listext_3 () { return $("//dd//li[text()='in a water storage area (also likely to be flood zone 3b in the strategic flood risk assessment)']") }
  get nextSteps_Download_AddAReferenceText () { return $("//details//span[contains(text(),'Add a reference to the flood map and set the scale')]") }
  get dowloadProduct1_Button () { return $("//button[contains(text(),'Download flood map for this location (PDF)')]") }

  get nextSteps_OrderFloodRiskDataHeader () { return $("//dt[contains(text(),'Order detailed flood risk data')]") }
  // Opted In Text Section
  get nextSteps_OrderFloodRiskData_Text () { return $("//dt[contains(text(),'Order detailed flood risk data')]/..//dd/p[text()='Order detailed flood risk information to be used for a flood risk assessment as part of a planning application.']") }
  get nextSteps_OrderFloodRiskData_Button () { return $("//a[contains(text(),'Order flood risk data')]") }
  // Optedn In and Flod zone 1 text section
  get nextSteps_OrderFloodRiskData_FZ1Text () { return $("//dt[contains(text(),'Order detailed flood risk data')]/..//dd/p[contains(text(),'Your site is in flood zone 1')]") }
  // Opted Out Text Section Order flood risk data(OFRD)
  get nextSteps_OFRD_OptedOut_Text () { return $("//dt[contains(text(),'Order detailed flood risk data')]/..//dd/p[1]") }
  get nextSteps_OFRD_OptedOut_EmailText () { return $("//dd/p[text()='Your email should say that you are ordering flood risk data and include:']") }
  get nextSteps_OFRD_OptedOut_EmailText_Li_1 () { return $("//dd/p[1]//following-sibling::ul/li[text()='the address']") }
  get nextSteps_OFRD_OptedOut_EmailText_Li_2 () { return $("//dd/p[1]//following-sibling::ul/li[text()='a map showing the site boundary']") }

  // Opted Out Text Section Order flood risk data(OFRD) -> Flood zone 1
  get nextSteps_OFRD_OptedOut_FZ1Text () { return $("//dd//p[contains(text(),'Your site is in flood zone 1, so it is unlikely we')]") }

  // Opted Out Text Section Order flood risk data(OFRD) -> Flood zone 2 and 3 text section
  get nextSteps_OFRD_OptedOut_EmailText_Days () { return $("//dd/p[text()='We aim to email you the data within 20 working days.']") }
  get nextSteps_OFRD_OptedOut_Text_1 () { return $("//dt[contains(text(),'Order detailed flood risk data')]/..//dd/p[4]") }
  get nextSteps_OFRD_OptedOut_Text_1_Li_1 () { return $("//dd/p[4]//following-sibling::ul/li[text()='a flood zone map (flood map for planning)']") }
  get nextSteps_OFRD_OptedOut_Text_1_Li_2 () { return $("//dd/p[4]//following-sibling::ul/li[text()='past flood outlines']") }
  get nextSteps_OFRD_OptedOut_Text_1_Li_3 () { return $("//dd/p[4]//following-sibling::ul/li[text()='relevant modelled flood levels and extents']") }
  get nextSteps_OFRD_OptedOut_Text_1_Li_4 () { return $("//dd/p[4]//following-sibling::ul/li[text()='flood defence locations and attributes']") }
  get nextSteps_OFRD_OptedOut_Text_1_Li_5 () { return $("//dd/p[4]//following-sibling::ul/li[text()='flood defence breach hazard information.']") }

  // Change the location section
  get nextSteps_ChangeLocationHeader () { return $("//dt[contains(text(),'Change the location')]") }
  get redrawTheBoundaryOfYourSite_link () { return $("//a[text()='Redraw the boundary of your site']") }
  get searchForADifferentLocation_link () { return $("//a[text()='Search for a different location']") }
  get nextSteps_ChangeLocation_Text () { return $("//dt[contains(text(),'Change the location')]/..//dd/p") }
  get nextSteps_TermsAndConditions_Link () { return $("//dt[contains(text(),'Change the location')]/..//dd/p/a[text()='terms and conditions']") }

  async getPageTitle () {
    const element = await this.pageTitle
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  async selectOrderFloodRiskData () {
    const element = await this.nextSteps_OrderFloodRiskData_Button
    await element.scrollIntoView()
    return await (await element.click())
  }

  async isOrderFloodRiskDataButtonDisplayed () {
    const element = await this.nextSteps_OrderFloodRiskData_Button
    return await element.isDisplayed()
  }

  // #region  functions to verify flood risk assessment section

  // verify that swAndRandSHeader is displayed
  async isSwAndRandSHeaderDisplayed () {
    const element = await this.swAndRandSHeader
    return await element.isDisplayed()
  }

  // verify that RandSText is displayed
  async isRandSTextDisplayed () {
    const element = await this.RandSText
    return await element.isDisplayed()
  }

  // verify that SWText is displayed
  async isSWTextDisplayed () {
    const element = await this.SWText
    return await element.isDisplayed()
  }

  async isFloodRiskAssessmentHeaderDisplayed () {
    const element = await this.floodRiskAssessmentHeader
    return await element.isDisplayed()
  }

  // verify that fraRequired is displayed and return true or false
  async verifyFraRequired_isDisplayed () {
    const element = await this.fraRequired
    return await element.isDisplayed()
  }

  // verify that fra_FZ1_LT_1Hectare is displayed
  async verifyFra_FZ1_LT_1Hectare_isDisplayed () {
    const element = await this.fra_FZ1_LT_1Hectare
    return await element.isDisplayed()
  }

  // verify that fra_FZ1_LT_1Hectare_List_1 is displayed
  async verifyFra_FZ1_LT_1Hectare_List_1_isDisplayed () {
    const element = await this.fra_FZ1_LT_1Hectare_List_1
    return await element.isDisplayed()
  }

  // verify that fra_FZ1_LT_1Hectare_List_2 is displayed and it should be equal to the expected text
  async verifyFra_FZ1_LT_1Hectare_List_2_isDisplayed () {
    const element = await this.fra_FZ1_LT_1Hectare_List_2
    const expectedText = ''
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    console.log('List 2 text : ' + await element.getText())
    // await expect(await element.getText()).toContain(expectedText)
  }

  // verify that fra_FZ1_LT_1Hectare_List_3 is displayed and it should be equal to the expected text
  async verifyFra_FZ1_LT_1Hectare_List_3_isDisplayed () {
    const element = await this.fra_FZ1_LT_1Hectare_List_3
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    console.log('List 3 text : ' + await element.getText())
    // await expect(await element.getText()).toContain(expectedText)
  }

  // verify that fra_FZ1_GT_1Hectare is displayed
  async verifyFra_FZ1_GT_1Hectare_isDisplayed () {
    const element = await this.fra_FZ1_GT_1Hectare
    return await element.isDisplayed()
  }

  async isAreaDisplayed () {
    const element = await this.area
    return await element.isDisplayed()
  }

  async getCoreText_1 () {
    const element = await this.coreText_1
    return await (await element.getText())
  }

  // verify that core text is displayed and it should be equal to the expected text
  async verifyCoreText_1 (expectedText) {
    const element = await this.coreText_1
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain(expectedText)
  }

  // verify that residual risk link is displayed
  async verifyResidualRiskLink_isDisplayed () {
    const element = await this.residualRisk_link
    return await element.isDisplayed()
  }

  // verify that core text 2 is displayed
  async verifyCoreText_2_isDisplayed () {
    const element = await this.coreText_2
    return await element.isDisplayed()
  }

  // Verify FRA section for flood zone 1 less than 1 hectare
  async verifyFRA_FZ1_LT_1HectareSection () {
    await this.verifyFra_FZ1_LT_1Hectare_isDisplayed()
    await this.verifyFra_FZ1_LT_1Hectare_List_1_isDisplayed()
    await this.verifyFra_FZ1_LT_1Hectare_List_2_isDisplayed()
    await this.verifyFra_FZ1_LT_1Hectare_List_3_isDisplayed()
  }

  // #endregion

  // verify all the core components in Results Page
  async isCoreTexts_Displayed () {
    await expect(await this.isFloodRiskAssessmentHeaderDisplayed()).toBe(true)
    console.log('core text 1 : ' + await this.getCoreText_1())
    await expect(await this.verifyResidualRiskLink_isDisplayed()).toBe(true)
    await expect(await this.verifyCoreText_2_isDisplayed()).toBe(true)
    await expect(await this.verifyRiversAndSeaTableHeaderIsDisplayed()).toBe(true)
    await expect(await this.verifyRiversAndSea_SeeThisRiskOnMap_linkIsDisplayed()).toBe(true)
    await expect(await this.verifyRiversAndSea_FindOutMoreAboutFloodZoneLink_IsDisplayed()).toBe(true)
  }

  // #region  functions for Rivers and sea section

  // verify that Rivers and sea table header is displayed
  async verifyRiversAndSeaTableHeaderIsDisplayed () {
    const element = await this.riversAndSeaTableHaeader
    return await element.isDisplayed()
  }

  // verify that Rivers and sea sea this risk on map link is displayed
  async verifyRiversAndSea_SeeThisRiskOnMap_linkIsDisplayed () {
    const element = await this.riversAndSea_SeeThisRiskOnMap_link
    return await element.isDisplayed()
  }

  // #region  Rivers and sea table "what flood zone means " section

  // verify that Rivers and sea flood zone info is displayed and it should be equal to the expected text
  async verifyRiversAndSea_FoodZoneKey (expectedFloodZone) {
    const element = await this.riversAndSea_FoodZoneInfo
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('What flood zone ' + expectedFloodZone + ' means')
  }

  // verify that flood zone Probability is displayed for zone 1 and it should be equal to the expected text
  async verifyRiversAndSea_FloodZone1_Probability (expectedFloodZone, chanceOfProbability) {
    const element = await this.riversAndSea_FloodZone1_Probability
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('Land within flood zone ' + expectedFloodZone + ' has a ' + chanceOfProbability + ' probability of flooding from rivers and the sea.')
  }

  // verify that flood zone Probability is displayed  for zone 2 ad 3 and it should be equal to the expected text
  async verifyRiversAndSea_FloodZoneInfo (expectedFloodZone, chanceOfProbability) {
    const element = await this.riversAndSea_FloodZone_Probability
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('Land within flood zone ' + expectedFloodZone + ' has a ' + chanceOfProbability + ' probability of flooding from rivers and the sea.')
  }

  // verify that rivers and sea "You need to carry out a flood risk assessment (FRA) as part of the planning application for this development." Text is displayed
  async verifyRiversAndSea_FRARequired_isDisplayed () {
    const element = await this.riversAndSea_FRARequired
    return await element.isDisplayed()
  }

  // verify that rivers and sea "find out more about flood zones " link is displayed
  async verifyRiversAndSea_FindOutMoreAboutFloodZoneLink_IsDisplayed () {
    const element = await this.riversAndSea_FloodZoneLink
    return await element.isDisplayed()
  }

  // #endregion

  // #region Functions to verify Rivers and Sea Climate change section

  // #region  climate change Defended section

  // function to verify that Rivers and sea climate change header is displayed
  async verifyRiversAndSeaClimateChangeHeader_isDisplayed () {
    const element = await this.riversAndSeaClimateChangeHeader
    return await element.isDisplayed()
  }

  // function to verify that Rivers and sea climate change defended header is displayed
  async verifyRiversAndSeaClimateChangeDefendedHeader_isDisplayed () {
    const element = await this.rAndS_CC_defendedHeader
    return await element.isDisplayed()
  }

  // function to get the texy of Rivers and sea climate change defended probability text
  async getRiversAndSeaClimateChangeDefendedProbabilityText () {
    const element = await this.rAndS_cc_defendedPropability
    return await (await element.getText())
  }

  // function to verify that climate change defended list 1 is displayed and it should be equal to "from rivers for the period 2070 to 2125"
  async verifyRiversAndSeaClimateChangeDefended_List1_isDisplayed () {
    const element = await this.rAndS_cc_defended_List1
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('from rivers for the period 2070 to 2125')
  }

  // function to verify that climate change defended list 2 is displayed and it should be equal to "from the sea (tidal flooding) by the year 2125"
  async verifyRiversAndSeaClimateChangeDefended_List2_isDisplayed () {
    const element = await this.rAndS_cc_defended_List2
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('from the sea (tidal flooding) by the year 2125')
  }

  // function to verify that Rivers and sea climate change defended summary header is displayed
  async verifyRiversAndSeaClimateChangeDefended_SummaryHeader_isDisplayed () {
    const element = await this.rAndS_cc_Defended_SummaryHeader
    return await element.isDisplayed()
  }

  // function to click on Rivers and sea climate change defended summary header
  async clickRiversAndSeaClimateChangeDefended_SummaryHeader () {
    const element = await this.rAndS_cc_Defended_SummaryHeader
    await element.scrollIntoView()
    return await element.click()
  }

  // function to verify that Rivers and sea climate change defended summary text 1 is displayed and it should be equal to "our modelling has taken into account the presence of existing flood defences"
  async verifyRiversAndSeaClimateChangeDefended_SummaryText_1_isDisplayed () {
    const element = await this.rAndS_cc_Defended_SummaryText_1
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('our modelling has taken into account the presence of existing flood defences')
  }

  // function to verify that Rivers and sea climate change defended summary text 2 is displayed and it should be equal to "there is still a flood risk if the flood defences fail or if their design standard is exceeded (if the flood event is more than they are designed to cope with)"
  async verifyRiversAndSeaClimateChangeDefended_SummaryText_2_isDisplayed () {
    const element = await this.rAndS_cc_Defended_SummaryText_2
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('there is still a flood risk if the flood defences fail or if their design standard is exceeded (if the flood event is more than they are designed to cope with)')
  }

  // function to verify that Rivers and sea climate change defended summary text 3 is displayed and it should be equal to "when considering climate change, we assume flood defences stay the same as present day"
  async verifyRiversAndSeaClimateChangeDefended_SummaryText_3_isDisplayed () {
    const element = await this.rAndS_cc_Defended_SummaryText_3
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('when considering climate change, we assume flood defences stay the same as present day')
  }

  // function to verify that Rivers and sea climate change defended data inconsistency header is displayed
  async verifyRiversAndSeaClimateChangeDefended_dataInconsistencyHeader_isDisplayed () {
    const element = await this.rAndS_cc_Defended_dataInconsistencyHeader
    return await element.isDisplayed()
  }

  // function to click on Rivers and sea climate change defended data inconsistency header
  async clickRiversAndSeaClimateChangeDefended_dataInconsistencyHeader () {
    const element = await this.rAndS_cc_Defended_dataInconsistencyHeader
    await element.scrollIntoView()
    return await element.click()
  }

  // function to verify that Rivers and sea climate change defended data inconistency text is displayed
  async verifyRiversAndSeaClimateChangeDefended_dataInconsistencyText_isDisplayed () {
    const element = await this.rAndS_cc_Defended_dataInconsistencyText
    return await element.isDisplayed()
  }

  // function to verify that Rivers and sea climate change defended data inconsistency find out more about link is displayed
  async verifyRiversAndSeaClimateChangeDefended_dataInconsistency_FindOutMoreAboutLink_isDisplayed () {
    const element = await this.rAndS_cc_Defended_dataInconsistency_FindOutMoreAboutLink
    return await element.isDisplayed()
  }

  // function to verify that Rivers and sea climate change defended data inconsistency text 2 is displayed
  async verifyRiversAndSeaClimateChangeDefended_dataInconsistencyText_2_isDisplayed () {
    const element = await this.rAndS_cc_Defended_dataInconsistencyText_2
    return await element.isDisplayed()
  }

  // function to verify that all the components in Rivers and sea climate change defended section are displayed
  async verifyRiversAndSeaClimateChangeDefendedSection (propabilityText) {
    await expect(await this.verifyRiversAndSeaClimateChangeHeader_isDisplayed()).toBe(true)
    await expect(await this.verifyRiversAndSeaClimateChangeDefendedHeader_isDisplayed()).toBe(true)
    console.log('Rivers and sea climate change defended header is displayed')
    await expect(await this.getRiversAndSeaClimateChangeDefendedProbabilityText()).toContain('Taking flood defences into account, there could be a ' + propabilityText + ' chance of flooding each year:') // Actual Probability text is verified in the test case
    await this.verifyRiversAndSeaClimateChangeDefended_List1_isDisplayed()
    await this.verifyRiversAndSeaClimateChangeDefended_List2_isDisplayed()
    await expect(await this.verifyRiversAndSeaClimateChangeDefended_SummaryHeader_isDisplayed()).toBe(true)
    await this.clickRiversAndSeaClimateChangeDefended_SummaryHeader()
    await this.verifyRiversAndSeaClimateChangeDefended_SummaryText_1_isDisplayed()
    await this.verifyRiversAndSeaClimateChangeDefended_SummaryText_2_isDisplayed()
    await this.verifyRiversAndSeaClimateChangeDefended_SummaryText_3_isDisplayed()
    await expect(await this.verifyRiversAndSeaClimateChangeDefended_dataInconsistencyHeader_isDisplayed()).toBe(true)
    await this.clickRiversAndSeaClimateChangeDefended_dataInconsistencyHeader()
    await expect(await this.verifyRiversAndSeaClimateChangeDefended_dataInconsistencyText_isDisplayed()).toBe(true)
    await expect(await this.verifyRiversAndSeaClimateChangeDefended_dataInconsistency_FindOutMoreAboutLink_isDisplayed()).toBe(true)
    await expect(await this.verifyRiversAndSeaClimateChangeDefended_dataInconsistencyText_2_isDisplayed()).toBe(true)
  }

  // #endregion

  // #region  climate change undefended section
  // function to verify that Rivers and sea climate change undefended header is displayed
  async verifyRiversAndSeaClimateChangeUndefendedHeader_isDisplayed () {
    const element = await this.rAndS_cc_UndefendedHeader
    return await element.isDisplayed()
  }

  // function to verify that Rivers and sea climate change undefended probability text 1 is displayed and it should be equal to "We have not modelled the 3.3% AEP event for an undefended scenario." where 3.3% is the value of chanceOfProbability
  async verifyRiversAndSeaClimateChangeUndefended_ProbabilityText1_isDisplayed (chanceOfProbability) {
    const element = await this.rAndS_cc_UndefendedPropabilityText1
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('We have not modelled the ' + chanceOfProbability + ' event for an undefended scenario.')
  }

  // function to verify that Rivers and sea climate change undefended probability text 2 is displayed and it should be equal to "Without flood defences, there could be a 1% AEP (1 in 100) chance of flooding each year:" where 1% AEP (1 in 100)is the value of chanceOfProbability
  async verifyRiversAndSeaClimateChangeUndefended_ProbabilityText2_isDisplayed (chanceOfProbability) {
    const element = await this.rAndS_cc_UndefendedPropabilityText2
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('Without flood defences, there could be a ' + chanceOfProbability + ' chance of flooding each year:')
  }

  // function to verify that Rivers and sea climate change undefended list 1 is displayed and it should be equal to "from rivers for the period 2070 to 2125"
  async verifyRiversAndSeaClimateChangeUndefended_List1_isDisplayed () {
    const element = await this.rAndS_cc_Undefended_List1
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('from rivers for the period 2070 to 2125')
  }

  // function to verify that Rivers and sea climate change undefended list 2 is displayed and it should be equal to "from the sea (tidal flooding) by the year 2125"
  async verifyRiversAndSeaClimateChangeUndefended_List2_isDisplayed () {
    const element = await this.rAndS_cc_Undefended_List2
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('from the sea (tidal flooding) by the year 2125')
  }

  // function to verify that Rivers and sea climate change undefended summary header is displayed
  async verifyRiversAndSeaClimateChangeUndefended_SummaryHeader_isDisplayed () {
    const element = await this.rAndS_cc_Undefended_SummaryHeader
    return await element.isDisplayed()
  }

  // function to click on Rivers and sea climate change undefended summary header
  async clickRiversAndSeaClimateChangeUndefended_SummaryHeader () {
    const element = await this.rAndS_cc_Undefended_SummaryHeader
    await element.scrollIntoView()
    return await element.click()
  }

  // function to verify that Rivers and sea climate change undefended summary text is displayed and it should be equal to "our modelling has not taken into account the presence of existing flood defences"
  async verifyRiversAndSeaClimateChangeUndefended_SummaryText_isDisplayed () {
    const element = await this.rAndS_cc_Undefended_SummaryText
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('our modelling ignores the presence of existing flood defences')
  }

  // function to verify that Rivers and sea climate change undefended data inconsistency header is displayed
  async verifyRiversAndSeaClimateChangeUndefended_dataInconsistencyHeader_isDisplayed () {
    const element = await this.rAndS_cc_Undefended_dataInconsistencyHeader
    return await element.isDisplayed()
  }

  // function to click on Rivers and sea climate change undefended data inconsistency header
  async clickRiversAndSeaClimateChangeUndefended_dataInconsistencyHeader () {
    const element = await this.rAndS_cc_Undefended_dataInconsistencyHeader
    await element.scrollIntoView()
    return await element.click()
  }

  // function to verify that Rivers and sea climate change undefended data inconsistency text is displayed
  async verifyRiversAndSeaClimateChangeUndefended_dataInconsistencyText_isDisplayed () {
    const element = await this.rAndS_cc_Undefended_dataInconsistencyText
    return await element.isDisplayed()
  }

  // function to verify that Rivers and sea climate change undefended data inconsistency find out more about link is displayed
  async verifyRiversAndSeaClimateChangeUndefended_dataInconsistency_FindOutMoreAboutLink_isDisplayed () {
    const element = await this.rAndS_cc_Undefended_dataInconsistency_FindOutMoreAboutLink
    return await element.isDisplayed()
  }

  // function to verify that Rivers and sea climate change undefended data inconsistency text 2 is displayed
  async verifyRiversAndSeaClimateChangeUndefended_dataInconsistencyText_2_isDisplayed () {
    const element = await this.rAndS_cc_Undefended_dataInconsistencyText_2
    return await element.isDisplayed()
  }

  // function to verify that all the components in Rivers and sea climate change undefended section are displayed
  async verifyRiversAndSeaClimateChangeUndefendedSection (Probability) {
    await expect(await this.verifyRiversAndSeaClimateChangeHeader_isDisplayed()).toBe(true)
    await expect(await this.verifyRiversAndSeaClimateChangeUndefendedHeader_isDisplayed()).toBe(true)
    console.log('Rivers and sea climate change undefended header is displayed')
    await this.verifyRiversAndSeaClimateChangeUndefended_ProbabilityText1_isDisplayed('3.3%')
    await this.verifyRiversAndSeaClimateChangeUndefended_ProbabilityText2_isDisplayed(Probability)
    await this.verifyRiversAndSeaClimateChangeUndefended_List1_isDisplayed()
    await this.verifyRiversAndSeaClimateChangeUndefended_List2_isDisplayed()
    await expect(await this.verifyRiversAndSeaClimateChangeUndefended_SummaryHeader_isDisplayed()).toBe(true)
    await this.clickRiversAndSeaClimateChangeUndefended_SummaryHeader()
    await this.verifyRiversAndSeaClimateChangeUndefended_SummaryText_isDisplayed()
    await this.clickRiversAndSeaClimateChangeUndefended_dataInconsistencyHeader()
    await expect(await this.verifyRiversAndSeaClimateChangeUndefended_dataInconsistencyText_isDisplayed()).toBe(true)
    await expect(await this.verifyRiversAndSeaClimateChangeUndefended_dataInconsistency_FindOutMoreAboutLink_isDisplayed()).toBe(true)
    await expect(await this.verifyRiversAndSeaClimateChangeUndefended_dataInconsistencyText_2_isDisplayed()).toBe(true)
  }

  // function to verify that Rivers and sea climate change find out more about link is displayed
  async verifyRiversAndSeaClimateChange_findOutMoreAboutCCLink_isDisplayed () {
    const element = await this.rAndS_cc_findOutMoreAboutCCLink
    return await element.isDisplayed()
  }

  // #endregion

  // #endregion

  // #region  Functions to verify Rivers and sea Present day section

  // #region  Rivers and sea Present day defended section
  // function to verify that Rivers and sea Present day header is displayed
  async verifyRiversAndSeaPresentDayHeader_isDisplayed () {
    const element = await this.rAndS_PresentDayHeader
    return await element.isDisplayed()
  }

  // function to verify that Rivers and sea Present day defended header is displayed
  async verifyRiversAndSeaPresentDayDefendedHeader_isDisplayed () {
    const element = await this.rAndS_PD_defendedHeader
    return await element.isDisplayed()
  }

  // function to get the text of Rivers and sea Present day defended probability text
  async getRiversAndSeaPresentDayDefendedProbabilityText () {
    const element = await this.rAndS_PD_defendedPropabilityText
    return await (await element.getText())
  }

  // function to verify that Rivers and sea Present day defended summary header is displayed
  async verifyRiversAndSeaPresentDayDefended_SummaryHeader_isDisplayed () {
    const element = await this.rAndS_PD_Defended_SummaryHeader
    return await element.isDisplayed()
  }

  // function to click on Rivers and sea Present day defended summary header
  async clickRiversAndSeaPresentDayDefended_SummaryHeader () {
    const element = await this.rAndS_PD_Defended_SummaryHeader
    await element.scrollIntoView()
    return await element.click()
  }

  // function to verify that Rivers and sea Present day defended summary text 1 is displayed and it should be equal to "our modelling has taken into account the presence of existing flood defences"
  async verifyRiversAndSeaPresentDayDefended_SummaryText_1_isDisplayed () {
    const element = await this.rAndS_PD_Defended_SummaryText_1
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('our modelling has taken into account the presence of existing flood defences')
  }

  // function to verify that Rivers and sea Present day defended summary text 2 is displayed and it should be equal to "there is still a flood risk if the flood defences fail or if their design standard is exceeded (if the flood event is more than they are designed to cope with)"
  async verifyRiversAndSeaPresentDayDefended_SummaryText_2_isDisplayed () {
    const element = await this.rAndS_PD_Defended_SummaryText_2
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('there is still a flood risk if the flood defences fail or if their design standard is exceeded (if the flood event is more than they are designed to cope with)')
  }

  // function to verify that Rivers and sea Present day defended summary text 3 is displayed and it should be equal to "when considering climate change, we assume flood defences stay the same as present day"
  async verifyRiversAndSeaPresentDayDefended_SummaryText_3_isDisplayed () {
    const element = await this.rAndS_PD_Defended_SummaryText_3
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('when considering climate change, we assume flood defences stay the same as present day')
  }

  // function to verify that Rivers and sea Present day defended data inconsistency header is displayed
  async verifyRiversAndSeaPresentDayDefended_dataInconsistencyHeader_isDisplayed () {
    const element = await this.rAndS_PD_Defended_dataInconsistencyHeader
    return await element.isDisplayed()
  }

  // function to click on Rivers and sea Present day defended data inconsistency header
  async clickRiversAndSeaPresentDayDefended_dataInconsistencyHeader () {
    const element = await this.rAndS_PD_Defended_dataInconsistencyHeader
    await element.scrollIntoView()
    return await element.click()
  }

  // function to verify that Rivers and sea Present day defended data inconsistency text is displayed
  async verifyRiversAndSeaPresentDayDefended_dataInconsistencyText_isDisplayed () {
    const element = await this.rAndS_PD_Defended_dataInconsistencyText
    return await element.isDisplayed()
  }

  // function to verify that Rivers and sea Present day defended data inconsistency find out more about link is displayed
  async verifyRiversAndSeaPresentDayDefended_dataInconsistency_FindOutMoreAboutLink_isDisplayed () {
    const element = await this.rAndS_PD_Defended_dataInconsistency_FindOutMoreAboutLink
    return await element.isDisplayed()
  }

  // function to verify that Rivers and sea Present day defended data inconsistency text 2 is displayed
  async verifyRiversAndSeaPresentDayDefended_dataInconsistencyText_2_isDisplayed () {
    const element = await this.rAndS_PD_Defended_dataInconsistencyText_2
    return await element.isDisplayed()
  }

  // function to verify that all the components in Rivers and sea Present day defended section are displayed
  async verifyRiversAndSeaPresentDayDefendedSection (propabilityText) {
    await expect(await this.verifyRiversAndSeaPresentDayHeader_isDisplayed()).toBe(true)
    await expect(await this.verifyRiversAndSeaPresentDayDefendedHeader_isDisplayed()).toBe(true)
    console.log('Rivers and sea Present day defended header is displayed')
    await expect(await this.getRiversAndSeaPresentDayDefendedProbabilityText()).toContain('Taking flood defences into account, there could be a ' + propabilityText + ' chance of a flood at this location each year.') // Actual Probability text is verified in the test case
    await expect(await this.verifyRiversAndSeaPresentDayDefended_SummaryHeader_isDisplayed()).toBe(true)
    await this.clickRiversAndSeaPresentDayDefended_SummaryHeader()
    await this.verifyRiversAndSeaPresentDayDefended_SummaryText_1_isDisplayed()
    await this.verifyRiversAndSeaPresentDayDefended_SummaryText_2_isDisplayed()
    await this.verifyRiversAndSeaPresentDayDefended_SummaryText_3_isDisplayed()
    await expect(await this.verifyRiversAndSeaPresentDayDefended_dataInconsistencyHeader_isDisplayed()).toBe(true)
    await this.clickRiversAndSeaPresentDayDefended_dataInconsistencyHeader()
    await expect(await this.verifyRiversAndSeaPresentDayDefended_dataInconsistencyText_isDisplayed()).toBe(true)
    await expect(await this.verifyRiversAndSeaPresentDayDefended_dataInconsistency_FindOutMoreAboutLink_isDisplayed()).toBe(true)
    await expect(await this.verifyRiversAndSeaPresentDayDefended_dataInconsistencyText_2_isDisplayed()).toBe(true)
  }

  // #endregion

  // #region  Rivers and sea Present day undefended section
  // function to verify that Rivers and sea Present day undefended header is displayed
  async verifyRiversAndSeaPresentDayUndefendedHeader_isDisplayed () {
    const element = await this.rAndS_PD_UndefendedHeader
    return await element.isDisplayed()
  }

  // function to verify that Rivers and sea Present day undefended probability text 1 is displayed and it should be equal to "We have not modelled the 3.3% AEP event for an undefended scenario." where 3.3% is the value of chanceOfProbability
  async verifyRiversAndSeaPresentDayUndefended_ProbabilityText_isDisplayed (chanceOfProbability) {
    const element = await this.rAndS_PD_UndefendedPropabilityText
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('Without flood defences, there could be a ' + chanceOfProbability + ' chance of a flood at this location each year.')
  }

  // function to verify that Rivers and sea Present day undefended summary header is displayed
  async verifyRiversAndSeaPresentDayUndefended_SummaryHeader_isDisplayed () {
    const element = await this.rAndS_PD_Undefended_SummaryHeader
    return await element.isDisplayed()
  }

  // function to click on Rivers and sea Present day undefended summary header
  async clickRiversAndSeaPresentDayUndefended_SummaryHeader () {
    const element = await this.rAndS_PD_Undefended_SummaryHeader
    await element.scrollIntoView()
    return await element.click()
  }

  // function to verify that Rivers and sea Present day undefended summary text is displayed and it should be equal to "our modelling ignores the presence of existing flood defences"
  async verifyRiversAndSeaPresentDayUndefended_SummaryText_isDisplayed () {
    const element = await this.rAndS_PD_Undefended_SummaryText
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('our modelling ignores the presence of existing flood defences')
  }

  // function to verify that Rivers and sea Present day undefended data inconsistency header is displayed
  async verifyRiversAndSeaPresentDayUndefended_dataInconsistencyHeader_isDisplayed () {
    const element = await this.rAndS_PD_Undefended_dataInconsistencyHeader
    return await element.isDisplayed()
  }

  // function to click on Rivers and sea Present day undefended data inconsistency header
  async clickRiversAndSeaPresentDayUndefended_dataInconsistencyHeader () {
    const element = await this.rAndS_PD_Undefended_dataInconsistencyHeader
    await element.scrollIntoView()
    return await element.click()
  }

  // function to verify that Rivers and sea Present day undefended data inconsistency text is displayed
  async verifyRiversAndSeaPresentDayUndefended_dataInconsistencyText_isDisplayed () {
    const element = await this.rAndS_PD_Undefended_dataInconsistencyText
    return await element.isDisplayed()
  }

  // function to verify that Rivers and sea Present day undefended data inconsistency find out more about link is displayed
  async verifyRiversAndSeaPresentDayUndefended_dataInconsistency_FindOutMoreAboutLink_isDisplayed () {
    const element = await this.rAndS_PD_Undefended_dataInconsistency_FindOutMoreAboutLink
    return await element.isDisplayed()
  }

  // function to verify that Rivers and sea Present day undefended data inconsistency text 2 is displayed
  async verifyRiversAndSeaPresentDayUndefended_dataInconsistencyText_2_isDisplayed () {
    const element = await this.rAndS_PD_Undefended_dataInconsistencyText_2
    return await element.isDisplayed()
  }

  // function to verify that all the components in Rivers and sea Present day undefended section are displayed
  async verifyRiversAndSeaPresentDayUndefendedSection (chanceOfProbability) {
    await expect(await this.verifyRiversAndSeaPresentDayHeader_isDisplayed()).toBe(true)
    await expect(await this.verifyRiversAndSeaPresentDayUndefendedHeader_isDisplayed()).toBe(true)
    console.log('Rivers and sea Present day undefended header is displayed')
    await this.verifyRiversAndSeaPresentDayUndefended_ProbabilityText_isDisplayed(chanceOfProbability)
    await expect(await this.verifyRiversAndSeaPresentDayUndefended_SummaryHeader_isDisplayed()).toBe(true)
    await this.clickRiversAndSeaPresentDayUndefended_SummaryHeader()
    await this.verifyRiversAndSeaPresentDayUndefended_SummaryText_isDisplayed()
    await this.clickRiversAndSeaPresentDayUndefended_dataInconsistencyHeader()
    await expect(await this.verifyRiversAndSeaPresentDayUndefended_dataInconsistencyText_isDisplayed()).toBe(true)
    await expect(await this.verifyRiversAndSeaPresentDayUndefended_dataInconsistency_FindOutMoreAboutLink_isDisplayed()).toBe(true)
    await expect(await this.verifyRiversAndSeaPresentDayUndefended_dataInconsistencyText_2_isDisplayed()).toBe(true)
  }

  // #endregion

  // #endregion

  // #endregion

  // #region Functions to verify Surface water Climate change and Present day section
  // function to verify that Surface water climate change header is displayed
  async verifySurfaceWaterTableHeader_isDisplayed () {
    const element = await this.surfaceWaterTableHeader
    return await element.isDisplayed()
  }

  // function to verify that surface water "see this risk on the map" link is displayed
  async verifySurfaceWaterSeeThisRiskOnTheMapLink_isDisplayed () {
    const element = await this.surfaceWater_SeeThisRiskOnMap_link
    return await element.isDisplayed()
  }

  // #region Functions to verify Surface water Climate change section

  // function to verify that Surface water climate change header is displayed
  async verifySurfaceWaterClimateChangeHeader_isDisplayed () {
    const element = await this.surfaceWaterClimateChangeHeader
    return await element.isDisplayed()
  }

  // function to get text from surface water climate change text 1 and it should be equal to "We do not currently show climate change scenarios for surface water."
  async verifySurfaceWaterClimateChangeText_1_isDisplayed () {
    const element = await this.sw_cc_text_1
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('We do not currently show climate change scenarios for surface water.')
  }

  // function to get text from surface water climate change text 2 and it should be equal to "You can see climate change and depth scenarios on the check the long term flood risk for an area in England service. The data shown in that service fall short of what is required to assess planned development but may help to inform risk assessments."
  async verifySurfaceWaterClimateChangeText_2_isDisplayed () {
    const element = await this.sw_cc_text_2
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('You can see climate change and depth scenarios on the check the long term flood risk for an area in England service. The data shown in that service fall short of what is required to assess planned development but may help to inform risk assessments.')
  }

  // function to get text from surface water climate change text 3 and it should be equal to "Read when and how to use climate change allowances in flood risk assessments"
  async verifySurfaceWaterClimateChangeText_3_isDisplayed () {
    const element = await this.sw_cc_text_3
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('Read when and how to use climate change allowances in flood risk assessments')
  }

  // function to verify that Surface water climate change check the long term flood risk link is displayed
  async verifySurfaceWaterClimateChange_checkTheLongTermFloodRiskLink_isDisplayed () {
    const element = await this.sw_CheckTheLongTermFloodRisk_link
    return await element.isDisplayed()
  }

  // function to verify that Surface water climate change find out more about link is displayed
  async verifySurfaceWaterClimateChange_HowToUseCCAllowancesLink_isDisplayed () {
    const element = await this.sw_HowToUseCCAllowances_link
    return await element.isDisplayed()
  }

  // function to verify all the components in Surface water climate change section are displayed
  async verifySurfaceWaterClimateChangeSection () {
    await expect(await this.verifySurfaceWaterTableHeader_isDisplayed()).toBe(true)
    await expect(await this.verifySurfaceWaterSeeThisRiskOnTheMapLink_isDisplayed()).toBe(true)
    await expect(await this.verifySurfaceWaterClimateChangeHeader_isDisplayed()).toBe(true)
    console.log('Surface water climate change header is displayed')
    await this.verifySurfaceWaterClimateChangeText_1_isDisplayed()
    await this.verifySurfaceWaterClimateChangeText_2_isDisplayed()
    await this.verifySurfaceWaterClimateChangeText_3_isDisplayed()
    await expect(await this.verifySurfaceWaterClimateChange_checkTheLongTermFloodRiskLink_isDisplayed()).toBe(true)
    await expect(await this.verifySurfaceWaterClimateChange_HowToUseCCAllowancesLink_isDisplayed()).toBe(true)
  }

  // #endregion

  // #region Functions to verify Surface water Present day section
  // function to verify that Surface water Present day header is displayed
  async verifySurfaceWaterPresentDayHeader_isDisplayed () {
    const element = await this.sw_PresentDayHeader
    return await element.isDisplayed()
  }

  // function verify that surface water present day text is displayed and it should be equal to "	The chance of surface water flooding at this location could be more than 1% (1 in 100) each year." where 1% (1 in 100) is the value of chanceOfProbability
  async verifySurfaceWaterPresentDayText_isDisplayed (chanceOfProbability) {
    const element = await this.sw_PD_text
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('The chance of surface water flooding at this location could be more than ' + chanceOfProbability + ' each year.')
  }

  // function to verify all the components in Surface water Present day section are displayed
  async verifySurfaceWaterPresentDaySection (chanceOfProbability) {
    await expect(await this.verifySurfaceWaterTableHeader_isDisplayed()).toBe(true)
    await expect(await this.verifySurfaceWaterSeeThisRiskOnTheMapLink_isDisplayed()).toBe(true)
    await expect(await this.verifySurfaceWaterPresentDayHeader_isDisplayed()).toBe(true)
    console.log('Surface water Present day header is displayed')
    await this.verifySurfaceWaterPresentDayText_isDisplayed(chanceOfProbability)
  }

  // #endregion

  // #endregion

  // #region Functions for Next Steps section
  // function to verify that Next steps header is displayed
  async verifyNextStepsHeader_isDisplayed () {
    const element = await this.nextStepsHeader
    return await element.isDisplayed()
  }

  // function to verify that next steps "Decide what you need " header is displayed
  async verifyNextSteps_DecideWhatYouNeedHeader_isDisplayed () {
    const element = await this.nextSteps_DecideWhatYouNeedHeader
    return await element.isDisplayed()
  }

  // function to verify that "I need help deciding what to include in my planning application." link is displayed
  async verifyNextSteps_DecideWhatNeedToIncludeLink_isDisplayed () {
    const element = await this.nextSteps_DecideWhatNeedToInclude_LinkText
    return await element.isDisplayed()
  }

  // function to verfy that "nextSteps_DownloadAFloodMapHeader" header is displayed
  async verifyNextSteps_DownloadAFloodMapHeader_isDisplayed () {
    const element = await this.nextSteps_DownloadAFloodMapHeader
    return await element.isDisplayed()
  }

  // function to get text from "nextSteps_DownloadFloodMap_Text" and it should be equal to "The flood map is suitable for a local planning authority to use when checking a planning application to see if a development is:"
  async verifyNextSteps_DownloadFloodMap_Text_isDisplayed () {
    const element = await this.nextSteps_DownloadFloodMap_Text
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('The flood map is suitable for a local planning authority to use when checking a planning application to see if a development is:')
  }

  // function to verify that "nextSteps_DownloadFloodMap_Listext_1" is displayed
  async verifyNextSteps_DownloadFloodMap_Listext_1_isDisplayed () {
    const element = await this.nextSteps_DownloadFloodMap_Listext_1
    return await element.isDisplayed()
  }

  // function to verify that "nextSteps_DownloadFloodMap_Listext_2" is displayed
  async verifyNextSteps_DownloadFloodMap_Listext_2_isDisplayed () {
    const element = await this.nextSteps_DownloadFloodMap_Listext_2
    return await element.isDisplayed()
  }

  // function to verify that "nextSteps_DownloadFloodMap_Listext_3" is displayed
  async verifyNextSteps_DownloadFloodMap_Listext_3_isDisplayed () {
    const element = await this.nextSteps_DownloadFloodMap_Listext_3
    return await element.isDisplayed()
  }

  // function to verify that "nextSteps_Download_AddAReferenceText" is displayed
  async verifyNextSteps_Download_AddAReferenceText_isDisplayed () {
    const element = await this.nextSteps_Download_AddAReferenceText
    return await element.isDisplayed()
  }

  // function to verify that "dowloadProduct1_Button" is displayed
  async verifyDownloadProduct1_Button_isDisplayed () {
    const element = await this.dowloadProduct1_Button
    return await element.isDisplayed()
  }

  // function to verify all the components in Next steps section 1 and 2 are displayed
  async verifyNextStepsSection_1And2 () {
    await expect(await this.verifyNextStepsHeader_isDisplayed()).toBe(true)
    await expect(await this.verifyNextSteps_DecideWhatYouNeedHeader_isDisplayed()).toBe(true)
    console.log('Next steps header is displayed')
    await this.verifyNextSteps_DownloadFloodMap_Text_isDisplayed()
    await expect(await this.verifyNextSteps_DownloadFloodMap_Listext_1_isDisplayed()).toBe(true)
    await expect(await this.verifyNextSteps_DownloadFloodMap_Listext_2_isDisplayed()).toBe(true)
    await expect(await this.verifyNextSteps_DownloadFloodMap_Listext_3_isDisplayed()).toBe(true)
    await expect(await this.verifyNextSteps_Download_AddAReferenceText_isDisplayed()).toBe(true)
    await expect(await this.verifyDownloadProduct1_Button_isDisplayed()).toBe(true)
  }

  // function to verify that "nextSteps_OrderFloodRiskDataHeader" header is displayed
  async verifyNextSteps_OrderFloodRiskDataHeader_isDisplayed () {
    const element = await this.nextSteps_OrderFloodRiskDataHeader
    return await element.isDisplayed()
  }

  // function to verify that Opted In "nextSteps_OrderFloodRiskData_Text" is displayed
  async verifyNextSteps_OrderFloodRiskData_Text_isDisplayed () {
    const element = await this.nextSteps_OrderFloodRiskData_Text
    return await element.isDisplayed()
  }

  // This text is displayed for Flood Zone 1
  // function to verify that Opted In and Flood zone 1 "nextSteps_OrderFloodRiskData_FZ1Text" is displayed
  async verifyNextSteps_OrderFloodRiskData_Listext_1_isDisplayed () {
    const element = await this.nextSteps_OrderFloodRiskData_FZ1Text
    return await element.isDisplayed()
  }

  // dunction to verify that Opted In "nextSteps_OrderFloodRiskData_Button" is displayed
  async verifyNextSteps_OrderFloodRiskData_Button_isDisplayed () {
    const element = await this.nextSteps_OrderFloodRiskData_Button
    return await element.isDisplayed()
  }

  // Next Steps section for Opted Out areas
  // function to verify that Opted Out "nextSteps_OFRD_OptedOut_Text" is displayed and it should contains "To order flood risk data for this site, contact the Environment Agency team in"
  async verifyNextSteps_OFRD_OptedOut_Text_isDisplayed () {
    const element = await this.nextSteps_OFRD_OptedOut_Text
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('To order flood risk data for this site, contact the Environment Agency team in')
  }

  // function to verify that Opted Out "nextSteps_OFRD_OptedOut_EmailText" is displayed
  async verifyNextSteps_OFRD_OptedOut_EmailText_isDisplayed () {
    const element = await this.nextSteps_OFRD_OptedOut_EmailText
    return await element.isDisplayed()
  }

  // function to verify that Opted Out "nextSteps_OFRD_OptedOut_EmailText_Li_1" is displayed
  async verifyNextSteps_OFRD_OptedOut_EmailText_Li_1_isDisplayed () {
    const element = await this.nextSteps_OFRD_OptedOut_EmailText_Li_1
    return await element.isDisplayed()
  }

  // function to verify that Opted Out "nextSteps_OFRD_OptedOut_EmailText_Li_2" is displayed
  async verifyNextSteps_OFRD_OptedOut_EmailText_Li_2_isDisplayed () {
    const element = await this.nextSteps_OFRD_OptedOut_EmailText_Li_2
    return await element.isDisplayed()
  }

  // function to verify that Opted Out "nextSteps_OFRD_OptedOut_FZ1Text" is displayed and it should be equal to "Your site is in flood zone 1, so it is unlikely we'll have any flood risk data for it. You can place an order and we will email you if none are available."
  async verifyNextSteps_OFRD_OptedOut_FZ1Text_isDisplayed () {
    const element = await this.nextSteps_OFRD_OptedOut_FZ1Text
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain("Your site is in flood zone 1, so it is unlikely we'll have any flood risk data for it. You can place an order and we will email you if none are available.")
  }

  // function to verify that Opted Out "nextSteps_OFRD_OptedOut_EmailText_Days" is displayed
  async verifyNextSteps_OFRD_OptedOut_EmailText_Days_isDisplayed () {
    const element = await this.nextSteps_OFRD_OptedOut_EmailText_Days
    return await element.isDisplayed()
  }

  // function to verify that Opted Out "nextSteps_OFRD_OptedOut_Text_1" is displayed and should be equal to "Depending on the information that's available, your flood risk data could include:"
  async verifyNextSteps_OFRD_OptedOut_Text_1_isDisplayed () {
    const element = await this.nextSteps_OFRD_OptedOut_Text_1
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain("Depending on the information that's available, your flood risk data could include:")
  }

  // function to verify that Opted Out "nextSteps_OFRD_OptedOut_Text_1_Li_1" is displayed
  async verifyNextSteps_OFRD_OptedOut_Text_2_isDisplayed () {
    const element = await this.nextSteps_OFRD_OptedOut_Text_1_Li_1
    return await element.isDisplayed()
  }

  // function to verify that Opted Out "nextSteps_OFRD_OptedOut_Text_1_Li_2" is displayed
  async verifyNextSteps_OFRD_OptedOut_Text_3_isDisplayed () {
    const element = await this.nextSteps_OFRD_OptedOut_Text_1_Li_2
    return await element.isDisplayed()
  }

  // function to verify that Opted Out "nextSteps_OFRD_OptedOut_Text_1_Li_3" is displayed
  async verifyNextSteps_OFRD_OptedOut_Text_4_isDisplayed () {
    const element = await this.nextSteps_OFRD_OptedOut_Text_1_Li_3
    return await element.isDisplayed()
  }

  // function to verify that Opted Out "nextSteps_OFRD_OptedOut_Text_1_Li_4" is displayed
  async verifyNextSteps_OFRD_OptedOut_Text_5_isDisplayed () {
    const element = await this.nextSteps_OFRD_OptedOut_Text_1_Li_4
    return await element.isDisplayed()
  }

  // function to verify that Opted Out "nextSteps_OFRD_OptedOut_Text_1_Li_5" is displayed
  async verifyNextSteps_OFRD_OptedOut_Text_6_isDisplayed () {
    const element = await this.nextSteps_OFRD_OptedOut_Text_1_Li_5
    return await element.isDisplayed()
  }

  // function to verify that all the components in Next steps section for OptedOut areas are displayed
  async verifyNextStepsSection_OptedOut (zone) {
    await expect(await this.verifyNextStepsHeader_isDisplayed()).toBe(true)
    await expect(await this.verifyNextSteps_OrderFloodRiskDataHeader_isDisplayed()).toBe(true)
    console.log('Next steps header is displayed')
     // verify whether the url contains internal if yes then check for optednin text
        const currentUrl = await browser.getUrl()
        if (currentUrl.includes('internal')) {
          console.log('The URL contains "internal".')
          await expect(await this.verifyNextSteps_OrderFloodRiskData_Text_isDisplayed()).toBe(true)
        } else {
          console.log('The URL does not contain "internal".')
          await this.verifyNextSteps_OFRD_OptedOut_Text_isDisplayed()
          await expect(await this.verifyNextSteps_OFRD_OptedOut_EmailText_isDisplayed()).toBe(true)
          await expect(await this.verifyNextSteps_OFRD_OptedOut_EmailText_Li_1_isDisplayed()).toBe(true)
          await expect(await this.verifyNextSteps_OFRD_OptedOut_EmailText_Li_2_isDisplayed()).toBe(true)

          if (zone === '1') {
          await this.verifyNextSteps_OFRD_OptedOut_FZ1Text_isDisplayed()
          } else {
          await expect(await this.verifyNextSteps_OFRD_OptedOut_EmailText_Days_isDisplayed()).toBe(true)
          await this.verifyNextSteps_OFRD_OptedOut_Text_1_isDisplayed()
          await expect(await this.verifyNextSteps_OFRD_OptedOut_Text_2_isDisplayed()).toBe(true)
          await expect(await this.verifyNextSteps_OFRD_OptedOut_Text_3_isDisplayed()).toBe(true)
          await expect(await this.verifyNextSteps_OFRD_OptedOut_Text_4_isDisplayed()).toBe(true)
          await expect(await this.verifyNextSteps_OFRD_OptedOut_Text_5_isDisplayed()).toBe(true)
          await expect(await this.verifyNextSteps_OFRD_OptedOut_Text_6_isDisplayed()).toBe(true)
    }
        }
    
  }

  // function to verify all the componets in next steps section for OptedIn areas are displayed
  async verifyNextStepsSection_OptedIn (zone) {
    await expect(await this.verifyNextStepsHeader_isDisplayed()).toBe(true)
    console.log('Next steps header is displayed')
    await expect(await this.verifyNextSteps_OrderFloodRiskDataHeader_isDisplayed()).toBe(true)
    await expect(await this.verifyNextSteps_OrderFloodRiskData_Text_isDisplayed()).toBe(true)
    if (zone === '1') {
      await expect(await this.verifyNextSteps_OrderFloodRiskData_Listext_1_isDisplayed()).toBe(true)
    } else {
      await expect(await this.verifyNextSteps_OrderFloodRiskData_Listext_1_isDisplayed()).toBe(false)
    }
    await expect(await this.verifyNextSteps_OrderFloodRiskData_Button_isDisplayed()).toBe(true)
  }

  // function to verify "nextSteps_ChangeLocationHeader"  header is displayed
  async verifyNextSteps_ChangeLocationHeader_isDisplayed () {
    const element = await this.nextSteps_ChangeLocationHeader
    return await element.isDisplayed()
  }

  // function to verify that "redrawTheBoundaryOfYourSite_link" link is displayed
  async verifyNextSteps_redrawTheBoundaryOfYourSite_link_isDisplayed () {
    const element = await this.redrawTheBoundaryOfYourSite_link
    return await element.isDisplayed()
  }

  // function to verify that "searchForADifferentLocation_link" link is displayed
  async verifyNextSteps_searchForADifferentLocation_link_isDisplayed () {
    const element = await this.searchForADifferentLocation_link
    return await element.isDisplayed()
  }

  // function to verify that "nextSteps_ChangeLocation_Text" is displayed and it should be equal to "The material displayed, including maps and risk data, is provided without any guarantees, conditions or warranties as to its accuracy. See our terms and conditions for more information."
  async verifyNextSteps_ChangeLocation_Text_isDisplayed () {
    const element = await this.nextSteps_ChangeLocation_Text
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('The material displayed, including maps and risk data, is provided without any guarantees, conditions or warranties as to its accuracy. See our terms and conditions for more information.')
  }

  // function to verify that all the components in next steps change location section are displayed
  async verifyNextSteps_ChangeLocationSection () {
    await expect(await this.verifyNextSteps_ChangeLocationHeader_isDisplayed()).toBe(true)
    console.log('Next steps change location header is displayed')
    await expect(await this.verifyNextSteps_redrawTheBoundaryOfYourSite_link_isDisplayed()).toBe(true)
    await expect(await this.verifyNextSteps_searchForADifferentLocation_link_isDisplayed()).toBe(true)
    await this.verifyNextSteps_ChangeLocation_Text_isDisplayed()
  }

  // function to verify that all the components in next steps section are displayed
  async verifyNextStepsSection (OptedIn, zone) {
    await expect(await this.verifyNextStepsHeader_isDisplayed()).toBe(true)
    console.log('Next steps header is displayed')
    await this.verifyNextStepsSection_1And2()
    if (OptedIn) {
      await this.verifyNextStepsSection_OptedIn(zone)
    } else {
      await this.verifyNextStepsSection_OptedOut(zone)
    }
    await this.verifyNextSteps_ChangeLocationSection()
  }

  // function to verify that Next steps text is displayed and it should be equal to "You can find out more about flood risk and what to do if you are at risk of flooding on the following pages:"
  async verifyNextStepsText_isDisplayed () {
    const element = await this.nextStepsText
    await element.waitForExist({ timeout: 5000 })
    expect(await element.isDisplayed()).toBe(true)
    await expect(await element.getText()).toContain('You can find out more about flood risk and what to do if you are at risk of flooding on the following pages:')
  }
  // #endregion
}

module.exports = new FloodZoneResults()
