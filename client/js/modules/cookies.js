// inferGaCookieDomain is required as GA inconsistently sets the cookies domain
// for the main PROD site it is .flood-map-for-planning.service.gov.uk
// but for the dev, tst, pre it is just .defra.cloud
// and for localhost it is not required
// without this, cookie deletion wont work
const inferGaCookieDomain = () => {
  const domain = document.domain
  if (domain.match('flood-map-for-planning.service.gov.uk')) {
    return 'domain=.flood-map-for-planning.service.gov.uk;'
  }
  if (domain.match('.defra.cloud')) {
    return 'domain=.defra.cloud;'
  }
  return ''
}

const deleteGaCookies = (analyticsAccount) => {
  const cookies = document.cookie.split(';')
  cookies.forEach((cookie) => {
    const [name = ''] = cookie.split('=')
    if (name.match('_gid|_ga')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;${inferGaCookieDomain()}`
    }
  })
  if (analyticsAccount) {
    // This is also required, as without it analytics makes one last call,
    // which reinstates one of the GA cookies, that we just deleted
    window[`ga-disable-${analyticsAccount}`] = true
  }
}

export default function () {
  const cookieBanner = document.querySelector('.js-cookies-banner')
  const questionBanner = document.querySelector('.js-question-banner')
  const acceptedBanner = document.querySelector('.js-cookies-accepted')
  const rejectedBanner = document.querySelector('.js-cookies-rejected')
  const acceptButton = document.querySelector('.js-cookies-button-accept')
  const rejectButton = document.querySelector('.js-cookies-button-reject')
  const govukDisplayNoneClass = 'govuk-!-display-none'

  function showBanner (banner) {
    banner.removeAttribute('hidden')
    // Shift focus to the banner
    banner.setAttribute('tabindex', '-1')
    banner.focus()
    banner.addEventListener('blur', function () {
      banner.removeAttribute('tabindex')
    })
  }

  function setCookie (cName, cValue, expDays) {
    const date = new Date()
    date.setTime(date.getTime() + expDays * 24 * 60 * 60 * 1000)
    const expires = 'expires=' + date.toUTCString()
    document.cookie = cName + '=' + cValue + '; ' + expires + '; path=/'
  }

  function splitCookies (cookie) {
    return cookie.split('=')
  }

  function cookieReducerFn (acc, cookieArr) {
    const key = cookieArr[0].trim()
    const value = cookieArr[1]
    acc[key] = value
    return acc
  }

  window.FMfP = {
    deleteGaCookies
  }

  function getCookie (key) {
    // Internet Explorer v.<=11 does not support arrow functions, string literals, object destructuring
    const cookies = document.cookie.split(';').map(splitCookies).reduce(cookieReducerFn, {})
    return cookies[key]
  }
  const cookieName = 'GA'
  const doesCookieExist = getCookie(cookieName)

  const acceptFn = function () {
    setCookie(cookieName, 'Accept', 365)
    questionBanner.setAttribute('hidden', true)
    showBanner(acceptedBanner)
  }
  const rejectFn = function () {
    setCookie(cookieName, 'Reject', 365)
    questionBanner.setAttribute('hidden', true)
    // Now we also need to delete any analytics cookies
    deleteGaCookies()
    showBanner(rejectedBanner)
  }

  acceptButton.addEventListener('click', acceptFn)
  rejectButton.addEventListener('click', rejectFn)

  acceptedBanner.addEventListener('click', function () {
    cookieBanner.classList.add(govukDisplayNoneClass)
  })
  rejectedBanner.addEventListener('click', function () {
    cookieBanner.classList.add(govukDisplayNoneClass)
  })

  if (!doesCookieExist) {
    cookieBanner.classList.remove(govukDisplayNoneClass)
    questionBanner.removeAttribute('hidden')
  }

  // Remove the js-only class from any element that has it.
  // .js-only elements are hidden in the css so this effectively shows the .js-only (by removing the class)
  // but only if js is enabled (as this wont run if it isn't).
  Array.from(document.getElementsByClassName('js-only')).forEach((element) => element.classList.remove('js-only'))
}
