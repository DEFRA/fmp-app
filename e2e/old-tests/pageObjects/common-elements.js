'use strict'

class Common {
  // LOCATORS
  get pageTitle () { return $('head > title') }
  get cookiesBanner () { return $('body >.govuk-cookie-banner.js-cookies-banner >.govuk-cookie-banner__message.govuk-width-container.js-question-banner') }
  get acceptAnalyticalCookies () { return $('button[class$=\'cookies-button-accept\']') }
  get rejectAnalyticalCookies () { return $('button[class$=\'cookies-button-reject\']') }
  get viewCookie () { return $('[class=\'govuk-button-group\'] a') }
  get feedbackLink () { return $('a[href$=\'feedback\']') }
  get cookieBannerAcceptedMsg () { return $('[class$=\'js-cookies-accepted\'] p') }
  get cookieBannerRejectedMsg () { return $('[class$=\'js-cookies-rejected\'] p') }
  get changeCookieSettingsAfterAccept () { return $('[class$=\'js-cookies-accepted\'] p a[href=\'#\']') }
  get changeCookieSettingsAfterReject () { return $('[class$=\'js-cookies-rejected\'] p a[href=\'#\']') }

  get headerLink () { return $('a[class$=\'service-name\']') }
  get govLogo () { return $('span[class*=\'govuk-header__logo\']') }
  get betaBanner () { return $('p[class$=\'banner__content\']') }

  // FOOTER COMPONENT
  get cookiesLink () { return $('a[class*=\'govuk-footer\'][href$=\'cookies\']') }
  get accessibilityLink () { return $('a[href$=\'accessibility-statement\']') }
  get tandcsLink () { return $('a[href$=\'terms-and-conditions\']') }
  get privacyNoticeLink () { return $('a[href$=\'privacy-notice\']') }

  // FOOTER COMPONENT EXTERNAL LINKS
  get environmentAgencyLink () { return $('a[href$=\'environment-agency\']') }
  get osTandCsLinks () { return $('a[href=\'os-terms\']') }
  get openGovLicenseLink () { return $('[href*=\'open-government\']') }

  async selectFeedbackLink () {
    return await (await this.feedbackLink).click()
  }

  async acceptAdditionalCookiesFromBanner () {
    return await (await this.acceptAnalyticalCookies).click()
  }

  async rejectAdditionalCookiesFromBanner () {
    return await (await this.rejectAnalyticalCookies).click()
  }

  async selectViewCookieSettings () {
    return await (await this.viewCookie).click()
  }

  async selectFooterCookiesLink () {
    return await (await this.cookiesLink).click()
  }

  async getCookieBannerAcceptedMsg () {
    const element = await this.cookieBannerAcceptedMsg
    return await (await element.getText())
  }

  async getCookieBannerRejectedMsg () {
    const element = await this.cookieBannerRejectedMsg
    return await (await element.getText())
  }

  async selectChangeSettingsAfterAccepted () {
    return await (await this.changeCookieSettingsAfterAccept).click()
  }

  async selectChangeSettingsAfterRejected () {
    return await (await this.changeCookieSettingsAfterReject).click()
  }
}

module.exports = new Common()
