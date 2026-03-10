import { definePage } from '../.utils/page.js'
import { radioOption, button, link } from '../.utils/form-controls.js'

export const page = definePage({
  key: 'Cookies',
  slug: '/cookies',
  title: 'Cookies'
})

export const acceptAnalyticsCookies = radioOption('Yes')
export const rejectAnalyticsCookies = radioOption('No')

export const saveCookieSettingsButton = button('Save cookie settings')

// Internal links
export const privacyNoticeLink = link('Privacy notice')
export const termsAndConditionsLink = link('Terms and conditions')
