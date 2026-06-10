import { definePage } from '../.utils/page.js'
import { link } from '../.utils/form-controls.js'

export const page = definePage({
  slug: '/terms-and-conditions',
  title: 'Terms and conditions'
})
// Internal links
export const privacyNoticeLink = link('Privacy notice')
export const cookiesLink = link('Cookies')
export const osTermsLink = link('Ordnance Survey terms and conditions')
export const privacyPolicyLink = link('privacy policy')
export const cookiePolicyLink = link('cookie policy')

// External links
export const contactUsLink = link('Contact us')
export const freedomOfInformationActLink = link('Freedom of Information Act')
export const dataProtectionActLink = link('Data Protection Act')
