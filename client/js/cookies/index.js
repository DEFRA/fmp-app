var acceptButton = document.querySelector('.js-cookies-button-accept')
var rejectButton = document.querySelector('.js-cookies-button-reject')
var acceptedBanner = document.querySelector('.js-cookies-accepted')
var rejectedBanner = document.querySelector('.js-cookies-rejected')
var questionBanner = document.querySelector('.js-question-banner')
var cookieBanner = document.querySelector('.js-cookies-banner')
function showBanner (banner) {
  questionBanner.setAttribute('hidden', 'hidden')
  banner.removeAttribute('hidden')
  // Shift focus to the banner
  banner.setAttribute('tabindex', '-1')
  banner.focus()
  banner.addEventListener('blur', function () {
    banner.removeAttribute('tabindex')
  })
}
acceptButton.addEventListener('click', function (event) {
  showBanner(acceptedBanner)
  event.preventDefault()
})
rejectButton.addEventListener('click', function (event) {
  showBanner(rejectedBanner)
  event.preventDefault()
})
acceptedBanner
  .querySelector('.js-hide')
  .addEventListener('click', function () {
    cookieBanner.setAttribute('hidden', 'hidden')
  })
rejectedBanner
  .querySelector('.js-hide')
  .addEventListener('click', function () {
    cookieBanner.setAttribute('hidden', 'hidden')
  })

function setCookie (key, value) {
  document.cookie = `${key}=${value}; max-age=31536000;`
}
function getCookie (key) {
  var cookies = document.cookie
    .split(';')
    .map(cookie => cookie.split('='))
    .reduce((acc, [key, value]) => ({ ...acc, [key.trim()]: value }), {})
  return cookies[key]
}
var cookieName = 'GA'
var doesCookieExist = getCookie(cookieName)
window.onload = () => {
  var acceptFn = () => {
    setCookie(cookieName, 'Accept')
    cookieBanner.setAttribute('hidden', 'hidden')
  }
  acceptButton.addEventListener('click', acceptFn)
  if (!doesCookieExist) {
    questionBanner
      .classList
      .remove('hidden')
  } else {
    cookieBanner.setAttribute('hidden', 'hidden')
  }
  var rejectFn = () => {
    setCookie(cookieName, 'Reject')
    cookieBanner.setAttribute('hidden', 'hidden')
  }
  rejectButton.addEventListener('click', rejectFn)
  if (!doesCookieExist) {
    questionBanner
      .classList
      .remove('hidden')
  } else {
    cookieBanner.setAttribute('hidden', 'hidden')
  }
}
