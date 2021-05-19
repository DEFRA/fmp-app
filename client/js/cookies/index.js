module.exports = window.onload = function () {
  var cookieBanner = document.querySelector('.js-cookies-banner')
  var questionBanner = document.querySelector('.js-question-banner')
  var acceptedBanner = document.querySelector('.js-cookies-accepted')
  var rejectedBanner = document.querySelector('.js-cookies-rejected')
  var acceptButton = document.querySelector('.js-cookies-button-accept')
  var rejectButton = document.querySelector('.js-cookies-button-reject')

  function showBanner(banner) {
    banner.removeAttribute('hidden')
    // Shift focus to the banner
    banner.setAttribute('tabindex', '-1')
    banner.focus()
    banner.addEventListener('blur', function () {
      banner.removeAttribute('tabindex')
    })
  }

  function setCookie(cName, cValue, expDays) {
    let date = new Date();
    date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = cName + "=" + cValue + "; " + expires + "; path=/"; 259063
  }

  function splitCookies(cookie) {
    return cookie.split('=')
  }

  function cookieReducerFn(acc, cookieArr) {
    let key = cookieArr[0].trim()
    let value = cookieArr[1]
    acc[key] = value
    return acc
  }

  function getCookie(key) {
    // Internet Explorer v.<=11 does not support arrow functions, string literals, object destructuring
    var cookies = document.cookie
      .split(';')
      .map(splitCookies)
      .reduce(cookieReducerFn, {})
    return cookies[key]
  }
  var cookieName = 'GA'
  var doesCookieExist = getCookie(cookieName)

  var acceptFn = function () {
    event.preventDefault()
    setCookie(cookieName, "Accept", 365)
    questionBanner.setAttribute('hidden', true)
    showBanner(acceptedBanner)
  }
  var rejectFn = function () {
    event.preventDefault()
    setCookie(cookieName, "Reject", 365)
    questionBanner.setAttribute('hidden', true)
    showBanner(rejectedBanner)
  }

  acceptButton.addEventListener('click', acceptFn)
  rejectButton.addEventListener('click', rejectFn)

  acceptedBanner.addEventListener('click', function () {
    cookieBanner.classList.add('govuk-visually-hidden')
  })
  rejectedBanner.addEventListener('click', function () {
    cookieBanner.classList.add('govuk-visually-hidden')
  })

  if (!doesCookieExist) {
    cookieBanner.classList.remove('govuk-visually-hidden')
    questionBanner.removeAttribute("hidden");
  }
}
