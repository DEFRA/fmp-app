import { definePage } from './.utils/page.js'
import { button, link } from './.utils/form-controls.js'

export const page = definePage({
  key: 'CheckYourDetails',
  slug: '/check-your-details',
  title: 'Check your details before requesting your data'
})

export const orderButton = button('Order flood risk data')
export const changeNameLink = link('Change Change name')
export const changeEmailLink = link('Change Change email address')
export const changeLocationLink = link('Change Change location')
