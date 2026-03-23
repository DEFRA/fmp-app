import { definePage } from './.utils/page.js'
import { textInput, errorText } from './.utils/form-controls.js'

export const page = definePage({
  key: 'Contact',
  slug: '/contact',
  title: 'Order your flood risk data'
})

export const fullNameInput = textInput('Name')
export const emailInput = textInput('Email address')

export const missingNameError = errorText('Enter your name')
export const missingEmailError = errorText('Enter an email address in the correct format, like name@example.com')
