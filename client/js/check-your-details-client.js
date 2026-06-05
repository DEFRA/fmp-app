import { showMap } from './static-map.js'

// Prevent 2nd p4 submission
const form = document.getElementsByTagName('form')[0]
const submitButton = document.querySelector('.order-product-four')
if (form && submitButton) {
  form.addEventListener('submit', () => {
    submitButton.disabled = true
  })
  // Re-enable submit button if user navigates back to page
  window.addEventListener('pageshow', () => {
    submitButton.disabled = false
  })
}

export { showMap }
