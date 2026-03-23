import { definePage } from '../.utils/page.js'
import { link } from '../.utils/form-controls.js'

export const page = definePage({
  key: 'PrivacyNotice',
  slug: '/privacy-notice',
  title: 'Privacy notice'
})
// Internal links
export const cookiesLink = link('Cookies')
export const termsAndConditionsLink = link('Terms and conditions')
export const aboutCookiesLink = link('find out more about cookies and how to manage them')

// External links
export const gdprLink = link('General Data Protection Regulation (GDPR)')
export const dataProtectionActLink = link('Data Protection Act (DPA) 2018')
export const personalInformationCharterLink = link('personal information charter')
export const webBrowserLink = link('web browser')
export const contactingUsLink = link('contacting us')
export const europeanEconomicAreaLink = link('European Economic Area')
export const accessYourDataLink = link('access your data')
export const informationCommissionersOfficeLink = link('Information Commissioner’s Office')
export const contactUsLink = link('contact us')
export const govUkVerifyLink = link('GOV.UK Verify')
