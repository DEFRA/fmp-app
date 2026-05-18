const GA_COOKIE_PREFIXES = ['_ga', '_gid', '_gat', '_dc_gtm_']

function buildDeletableDomains (hostname) {
  const domains = new Set()

  domains.add(hostname)
  domains.add('.' + hostname)

  const parts = hostname.split('.')

  for (let i = 1; i < parts.length - 1; i++) {
    domains.add('.' + parts.slice(i).join('.'))
  }

  return domains
}

function deleteGoogleAnalyticsCookies () {
  const allCookies = document.cookie.split(';')
  const hostname = window.location.hostname
  const domains = buildDeletableDomains(hostname)

  for (const cookie of allCookies) {
    const cookieName = cookie.split('=')[0].trim()
    const isGaCookie = GA_COOKIE_PREFIXES.some((prefix) => cookieName.startsWith(prefix))

    if (isGaCookie) {
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`

      for (const domain of domains) {
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domain}`
      }
    }
  }
}

function loadGoogleAnalytics (analyticsKey) {
  if (!analyticsKey || !/^(GTM-|G-)[A-Z0-9]+$/.test(analyticsKey)) {
    return
  }

  window.dataLayer = window.dataLayer || []

  if (analyticsKey.startsWith('GTM-')) {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtm.js?id=${analyticsKey}`
    document.head.appendChild(script)
  } else {
    function gtag () { window.dataLayer.push(arguments) }
    gtag('js', new Date())
    gtag('config', analyticsKey)
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsKey}`
    document.head.appendChild(script)
  }
}

export default function () {
  setupCookieComponentListeners()
  cleanupStaleCookies()
}

function cleanupStaleCookies () {
  const cookieContainer = document.querySelector('.js-cookies-container')

  if (cookieContainer) {
    return
  }

  const gaScript = document.querySelector('script[src*="googletagmanager.com"]')

  if (!gaScript) {
    deleteGoogleAnalyticsCookies()
  }
}

function setupCookieComponentListeners () {
  const cookieContainer = document.querySelector('.js-cookies-container')

  if (!cookieContainer) {
    return
  }

  const acceptButton = document.querySelector('.js-cookies-button-accept')
  const rejectButton = document.querySelector('.js-cookies-button-reject')
  const acceptedBanner = document.querySelector('.js-cookies-accepted')
  const rejectedBanner = document.querySelector('.js-cookies-rejected')
  const cookieBanner = document.querySelector('.js-cookies-banner')

  const crumb = cookieContainer.dataset.crumb
  const gtmKey = cookieContainer.dataset.gtmKey

  const formElement = cookieContainer.closest('form')

  const submitPreference = (accepted, onSuccess) => {
    const xhr = new XMLHttpRequest()

    xhr.open('POST', '/cookies', true)
    xhr.setRequestHeader('Content-Type', 'application/json')

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onSuccess()
      } else {
        formElement?.submit()
      }
    }

    xhr.onerror = () => {
      formElement?.submit()
    }

    xhr.send(JSON.stringify({
      analytics: accepted,
      async: true,
      crumb
    }))
  }

  const showBanner = (banner) => {
    const questionBanner = document.querySelector('.js-question-banner')
    questionBanner.setAttribute('hidden', 'hidden')
    banner.removeAttribute('hidden')
    banner.setAttribute('tabindex', '-1')
    banner.focus()

    banner.addEventListener('blur', () => {
      banner.removeAttribute('tabindex')
    })
  }

  acceptButton?.addEventListener('click', (event) => {
    event.preventDefault()
    showBanner(acceptedBanner)
    loadGoogleAnalytics(gtmKey)
    submitPreference(true, () => {})
  })

  rejectButton?.addEventListener('click', (event) => {
    event.preventDefault()
    showBanner(rejectedBanner)
    deleteGoogleAnalyticsCookies()
    submitPreference(false, () => {})
  })

  acceptedBanner?.querySelector('.js-hide')?.addEventListener('click', () => {
    cookieBanner.setAttribute('hidden', 'hidden')
  })

  rejectedBanner?.querySelector('.js-hide')?.addEventListener('click', () => {
    cookieBanner.setAttribute('hidden', 'hidden')
  })
}
