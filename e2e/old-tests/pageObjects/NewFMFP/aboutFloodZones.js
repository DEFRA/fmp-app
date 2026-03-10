'use strict'

class AboutFloodZones {
  // LOCATORS


  get pageTitle () { return $("//div[@id='flood-zone-results-explained']//h1") }
  get pageHeader () { return $("//div[@id='flood-zone-results-explained']//h1") }
  get pageBodyText_p_1 () { return $("//p[contains(text(),'Flood zones show areas of land that could flood from rivers (fluvial) or the sea (tidal), ignoring the benefits of any existing flood defences.')]") }
  get pageBodyText_p_2 () { return $("//p[contains(text(),'They are based on a location')]") }
  get pageBodyText_p_2_1 () { return $("//p[contains(text(),'chance of flooding from rivers or the sea in any year.')]") }
  get pageBodyText_p_3 () { return $("//p[contains(text(),'Flood zones do not take into account:')]") }
  get pageBodyText_li_1 () { return $("//ul/li[text()='other sources of flooding']") }
  get pageBodyText_li_2 () { return $("//ul/li[text()='the possible effects of climate change on rivers or the sea']") }
  get pageBodyText_p_4 () { return $("//p[contains(text(),'This means a site in flood zone 1 could still flood now or in the future.')]") }
  get pageBodyText_p_5 () { return $("//p[contains(text(),'Flood zones combine several datasets to create a picture of flood risk, including:')]") }
  get pageBodyText_li_3 () { return $("//ul/li[text()='undefended modelling']") }
  get pageBodyText_li_4 () { return $("//ul/li[text()='defended modelling']") }
  get pageBodyText_li_5 () { return $("//ul/li[text()='recorded flood outlines from past floods']") }
  get pageBodyText_li_6 () { return $("//ul/li[text()='other suitable data from third parties']") }
  get pageBodyText_p_6 () { return $("//p[contains(text(),'Flood zones take account of flood risk from watercourses with a catchment area greater than 3 square kilometres. They do not have to be classified as main rivers.')]") }
  get pageBodyText_p_7 () { return $("//p[contains(text(),'Where we have data for watercourses with catchments smaller than 3 square kilometres, we will include it in the flood zones if we consider it suitable.')]") }
  get pageBodyText_p_8 () { return $("//p[contains(text(),'If a smaller catchment is not included in a flood zone it does not necessarily mean there is no flood risk. If your site is in a smaller catchment not included in a flood zone, you may need further assessment to understand all the risks.')]") }
  

  // elements for Flood zone 1 section
  get fz1_header () { return $("//h2[contains(text(),'Flood zone 1')]") }
  get fz1_bodyText () { return $("//p[contains(text(),'Locations in flood zone 1 have a low probability of flooding.')]") }
  get fz1_bodyText_2 () { return $("//p[contains(text(),'This means, in any year, land has a less than 0.1% (1 in 1,000) chance of flooding from rivers or the sea.')]") }
  get fz1_bodyText_3 () { return $("//p[contains(text(),'Some flood zone 1 developments need a flood risk assessment as part of their planning application.')]") }
  get fz1_bodyText_4 () { return $("//p[contains(text(),'Find out')]") }
  get fz1_LinkText () { return $("//a[text()='when you need a flood risk assessment for development in flood zone 1']") }


  // elements for Flood zone 2 section
  get fz2_header () { return $("//h2[contains(text(),'Flood zone 2')]") }
  get fz2_bodyText () { return $("//p[contains(text(),'Locations in flood zone 2 have a medium probability of flooding.')]") }
  get fz2_bodyText_2 () { return $("//p[contains(text(),'This means, in any year, land has:')][1]") }
  get fz2_li_1 () { return $("//ul/li[contains(text(),'between a 1% and 0.1% (between 1 in 100 and 1 in 1,000) chance of flooding from rivers')]") }
  get fz2_li_2 () { return $("//ul/li[contains(text(),'between a 0.5% and 0.1% (between 1 in 200 and 1 in 1,000) chance of flooding from the sea.')]") }
  get fz2_bodyText_3 () { return $("//p[contains(text(),'Flood zone 2 developments need a flood risk assessment as part of their planning application.')]") }

  // elements for Flood zone 3 section
  get fz3_header () { return $("//h2[contains(text(),'Flood zone 3')]") }
  get fz3_bodyText () { return $("//p[contains(text(),'Locations in flood zone 3 have a high probability of flooding.')]") }
  get fz3_bodyText_2 () { return $("//p[contains(text(),'This means, in any year, land has:')][2]") }
  get fz3_li_1 () { return $("//ul/li[contains(text(),'a 1% (1 in 100) or more chance of flooding from rivers')]") }
  get fz3_li_2 () { return $("//ul/li[contains(text(),'a 0.5% (1 in 200) or more chance of flooding from the sea.')]") }
  get fz3_bodyText_3 () { return $("//p[contains(text(),'Flood zone 3 developments need a flood risk assessment as part of their planning application.')]") }

  // elements for Flood zone 3b section
  get fz3b_header () { return $("//h2[contains(text(),'Flood zone 3b (functional floodplain)')]") }
  get fz3b_bodyText () { return $("//p[contains(text(),'Locations in flood zone 3b are at the highest risk of flooding.')]") }
  get fz3b_bodyText_2 () { return $("//p[contains(text(),'Flood zone 3b is not shown on the flood map for planning service, as it is defined and mapped by local planning authorities (LPAs) in their strategic flood risk assessments.')]") }

  // elements for differnce between flood zones and flood extents section
  get floodZonesAndFloodExtents_header () { return $("//h2[contains(text(),'The difference between flood zones and flood extents')]") }
  get floodZonesAndFloodExtents_bodyText () { return $("//p[contains(text(),'Flood zones are sometimes different to the present day rivers and the sea extents because they combine several additional datasets to create a more complete picture of flood risk.')]") }

  // elements for flood defences section
  get floodDefences_header () { return $("//h2[contains(text(),'Flood defences')]") }
  get floodDefences_bodyText () { return $("//p[contains(text(),'Flood defences:')]") }
  get floodDefences_li_1 () { return $("//ul/li[contains(text(),'reduce the probability of flooding from a specific source (a river or the sea)')]") }
  get floodDefences_li_2 () { return $("//ul/li[contains(text(),'do not completely stop the chance of flooding because there may be a flood that is bigger than the one the defence is designed to protect against (this is called overtopping), or the defence can fail')]") }
  get floodDefences_li_3 () { return $("//ul/li[contains(text(),'may provide reduced protection over time because of climate change increasing flood risk in the future')]") }
  get floodDefences_bodyText_2 () { return $("//p[contains(text(),'There are different types of flood defence. They include:')]") }
  get floodDefences_li_4 () { return $("//ul/li[contains(text(),'embankments')]") }
  get floodDefences_li_5 () { return $("//ul/li[contains(text(),'flood gates that are in line with the river')]") }
  get floodDefences_li_6 () { return $("//ul/li[contains(text(),'flood walls')]") }
  get floodDefences_bodyText_3 () { return $("//p[contains(text(),'You can view a complete list of flood defences, called asset categories, on the')]") }
  get floodDefences_LinkText () { return $("//a[contains(text(),'Defra data services platform')]") }

  


  
  async getPageTitle () {
    const element = await this.pageTitle
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  // function to verify that the page header is present
  async getPageHeader () {
    const element = await this.pageHeader
    await element.waitForExist({ timeout: 5000 })
    return await (await element.getText())
  }

  async isFloodZonesAndWhatTheyMeanPageHeader_Displayed () {
    const element = await this.pageHeader
    await element.waitForExist({ timeout: 5000 })
    const elementText = await element.getText()
    const expText = 'Flood zones and what they mean'
    console.log('Flood zones and what they mean page header:', elementText)
    return await expect(elementText).toEqual(expText)
  }

  // function to verify that all the elements in the page are displayed
  async isFloodZonesAndWhatTheyMeanPageBodyTexts_Displayed () {
    // Verify the page body text elements are displayed
    expect(await this.pageBodyText_p_1.isDisplayed()).toBe(true)
    expect(await this.pageBodyText_p_2.isDisplayed()).toBe(true)
    expect(await this.pageBodyText_p_2_1.isDisplayed()).toBe(true)
    expect(await this.pageBodyText_p_3.isDisplayed()).toBe(true)
    expect(await this.pageBodyText_li_1.isDisplayed()).toBe(true)
    expect(await this.pageBodyText_li_2.isDisplayed()).toBe(true)   
    expect(await this.pageBodyText_p_4.isDisplayed()).toBe(true)
    expect(await this.pageBodyText_p_5.isDisplayed()).toBe(true)
    expect(await this.pageBodyText_li_3.isDisplayed()).toBe(true)
    expect(await this.pageBodyText_li_4.isDisplayed()).toBe(true)
    expect(await this.pageBodyText_li_5.isDisplayed()).toBe(true)
    expect(await this.pageBodyText_li_6.isDisplayed()).toBe(true)
    expect(await this.pageBodyText_p_6.isDisplayed()).toBe(true)
    expect(await this.pageBodyText_p_7.isDisplayed()).toBe(true)
    expect(await this.pageBodyText_p_8.isDisplayed()).toBe(true)

    // Verify the flood zone 1 section elements are displayed
    expect(await this.fz1_header.isDisplayed()).toBe(true)
    expect(await this.fz1_bodyText.isDisplayed()).toBe(true)
    expect(await this.fz1_bodyText_2.isDisplayed()).toBe(true)
    expect(await this.fz1_bodyText_3.isDisplayed()).toBe(true)
    expect(await this.fz1_bodyText_4.isDisplayed()).toBe(true)
    expect(await this.fz1_LinkText.isDisplayed()).toBe(true)


    // Verify the flood zone 2 section elements are displayed
    expect(await this.fz2_header.isDisplayed()).toBe(true)
    expect(await this.fz2_bodyText.isDisplayed()).toBe(true)
    expect(await this.fz2_bodyText_2.isDisplayed()).toBe(true)
    expect(await this.fz2_li_1.isDisplayed()).toBe(true)
    expect(await this.fz2_li_2.isDisplayed()).toBe(true)
    expect(await this.fz2_bodyText_3.isDisplayed()).toBe(true)


    // Verify the flood zone 3 section elements are displayed
    expect(await this.fz3_header.isDisplayed()).toBe(true)
    expect(await this.fz3_bodyText.isDisplayed()).toBe(true)
    expect(await this.fz3_bodyText_2.isDisplayed()).toBe(true)
    expect(await this.fz3_li_1.isDisplayed()).toBe(true)
    expect(await this.fz3_li_2.isDisplayed()).toBe(true)
    expect(await this.fz3_bodyText_3.isDisplayed()).toBe(true)


    // Verify the flood zone 3b section elements are displayed
    expect(await this.fz3b_header.isDisplayed()).toBe(true)
    expect(await this.fz3b_bodyText.isDisplayed()).toBe(true)
    expect(await this.fz3b_bodyText_2.isDisplayed()).toBe(true)

    // Verify the flood zones and flood extents section elements are displayed
    expect(await this.floodZonesAndFloodExtents_header.isDisplayed()).toBe(true)
    expect(await this.floodZonesAndFloodExtents_bodyText.isDisplayed()).toBe(true)


    // Verify the flood defences section elements are displayed
    expect(await this.floodDefences_header.isDisplayed()).toBe(true)
    expect(await this.floodDefences_bodyText.isDisplayed()).toBe(true)
    expect(await this.floodDefences_li_1.isDisplayed()).toBe(true)
    expect(await this.floodDefences_li_2.isDisplayed()).toBe(true)
    expect(await this.floodDefences_li_3.isDisplayed()).toBe(true)
    expect(await this.floodDefences_bodyText_2.isDisplayed()).toBe(true)
    expect(await this.floodDefences_li_4.isDisplayed()).toBe(true)
    expect(await this.floodDefences_li_5.isDisplayed()).toBe(true)
    expect(await this.floodDefences_li_6.isDisplayed()).toBe(true)
    expect(await this.floodDefences_bodyText_3.isDisplayed()).toBe(true)
    expect(await this.floodDefences_LinkText.isDisplayed()).toBe(true)
    console.log('All components in Flood zones and what they mean page are displayed')
    return true

  }

  // function to verify link text for flood zone 1
  async isFloodZone1_LinkText_Displayed () {
    const element = await this.fz1_LinkText
    await element.waitForExist({ timeout: 5000 })
    const elementText = await element.getText()
    const expText = 'when you need a flood risk assessment for development in flood zone 1'
    console.log('Flood zone 1 link text:', elementText)
    return await expect(elementText).toEqual(expText)
  }

  // function to click on the flood zone 1 link
  async clickFloodZone1_Link () {
    const element = await this.fz1_LinkText
    await element.waitForExist({ timeout: 5000 })
    await element.click()
    console.log('Clicked on flood zone 1 link')
    // Verify that the URL has changed to the expected one
    const currentUrl = await browser.getUrl()
    const expectedUrl = `https://www.gov.uk/guidance/flood-risk-assessment-for-planning-applications#when-you-need-an-assessment`
    return await expect(currentUrl).toContain(expectedUrl)
  }


  // function to verify link text for flood defences
  async isFloodDefences_LinkText_Displayed () {
    const element = await this.floodDefences_LinkText
    await element.waitForExist({ timeout: 5000 })
    const elementText = await element.getText()
    const expText = 'Defra data services platform'
    console.log('Flood defences link text:', elementText)
    return await expect(elementText).toEqual(expText)
  }

  // function to click on the flood defences link
  async clickFloodDefences_Link () {
    const element = await this.floodDefences_LinkText
    await element.waitForExist({ timeout: 5000 })
    await element.click()
    console.log('Clicked on flood defences link')
    // Verify that the URL has changed to the expected one
    const currentUrl = await browser.getUrl()
    const expectedUrl = `https://environment.data.gov.uk/asset-management/drl-app/revision/current/categories#Defence`
    return await expect(currentUrl).toContain(expectedUrl)
  }



  
  

}

module.exports = new AboutFloodZones()