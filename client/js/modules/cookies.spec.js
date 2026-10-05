/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://sub.example.com/"}
 */
// A multi-part hostname is used so buildDeletableDomains' parent-domain loop is exercised
const FakeXHR = jest.fn().mockImplementation(function () {
  this.open = jest.fn()
  this.setRequestHeader = jest.fn()
  this.send = jest.fn()
})

const clearAllCookies = () => {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim()
    if (name) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    }
  })
}

const loadCookiesModule = () => {
  jest.resetModules()
  return require('./cookies.js').default
}

// Builds the cookie banner markup expected by setupCookieComponentListeners
const buildCookieBannerDom = (gtmKey = 'GTM-XXXX') => {
  const form = document.createElement('form')
  form.action = '/next-steps'
  form.submit = jest.fn()

  const container = document.createElement('div')
  container.className = 'js-cookies-container'
  container.dataset.crumb = 'crumb-token'
  container.dataset.gtmKey = gtmKey

  const acceptButton = document.createElement('button')
  acceptButton.className = 'js-cookies-button-accept'
  const rejectButton = document.createElement('button')
  rejectButton.className = 'js-cookies-button-reject'
  container.appendChild(acceptButton)
  container.appendChild(rejectButton)

  const questionBanner = document.createElement('div')
  questionBanner.className = 'js-question-banner'

  const acceptedBanner = document.createElement('div')
  acceptedBanner.className = 'js-cookies-accepted'
  acceptedBanner.setAttribute('hidden', 'hidden')
  const acceptedHide = document.createElement('button')
  acceptedHide.className = 'js-hide'
  acceptedBanner.appendChild(acceptedHide)

  const rejectedBanner = document.createElement('div')
  rejectedBanner.className = 'js-cookies-rejected'
  rejectedBanner.setAttribute('hidden', 'hidden')
  const rejectedHide = document.createElement('button')
  rejectedHide.className = 'js-hide'
  rejectedBanner.appendChild(rejectedHide)

  const cookieBanner = document.createElement('div')
  cookieBanner.className = 'js-cookies-banner'

  form.appendChild(container)
  form.appendChild(questionBanner)
  form.appendChild(acceptedBanner)
  form.appendChild(rejectedBanner)
  form.appendChild(cookieBanner)
  document.body.appendChild(form)

  return { form, acceptButton, rejectButton, acceptedBanner, rejectedBanner, questionBanner, cookieBanner }
}

describe('cookies', () => {
  let setupCookies

  beforeEach(() => {
    document.body.innerHTML = ''
    document.head.querySelectorAll('script').forEach((script) => script.remove())
    clearAllCookies()
    global.XMLHttpRequest = FakeXHR
    // jsdom does not implement navigation/reload, silence its expected noise
    jest.spyOn(console, 'error').mockImplementation((err) => {
      if (err?.type === 'not implemented') {
        return
      }
      console.warn(err)
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    clearAllCookies()
  })

  describe('cleanupStaleCookies', () => {
    it('should delete GA cookies when there is no cookie banner and no GA script tag', () => {
      document.cookie = '_ga=GA1.1.111;path=/'
      setupCookies = loadCookiesModule()

      setupCookies()

      expect(document.cookie).not.toContain('_ga=')
    })

    it('should not delete cookies when a GA script tag is already present', () => {
      document.cookie = '_ga=GA1.1.111;path=/'
      const script = document.createElement('script')
      script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-XXXX'
      document.head.appendChild(script)
      setupCookies = loadCookiesModule()

      setupCookies()

      expect(document.cookie).toContain('_ga=')
    })

    it('should not delete cookies when the cookie banner container is present', () => {
      document.cookie = '_ga=GA1.1.111;path=/'
      const container = document.createElement('div')
      container.className = 'js-cookies-container'
      document.body.appendChild(container)
      setupCookies = loadCookiesModule()

      setupCookies()

      expect(document.cookie).toContain('_ga=')
    })
  })

  describe('setupBfcacheGuard', () => {
    it('should delete GA cookies when the page is restored from bfcache', () => {
      document.cookie = '_ga=GA1.1.111;path=/'
      setupCookies = loadCookiesModule()
      setupCookies()

      const event = new window.Event('pageshow')
      Object.defineProperty(event, 'persisted', { value: true })
      window.dispatchEvent(event)

      expect(document.cookie).not.toContain('_ga=')
    })

    it('should not delete GA cookies when the pageshow event is not persisted', () => {
      const container = document.createElement('div')
      container.className = 'js-cookies-container'
      document.body.appendChild(container)
      document.cookie = '_ga=GA1.1.111;path=/'
      setupCookies = loadCookiesModule()
      setupCookies()

      const event = new window.Event('pageshow')
      Object.defineProperty(event, 'persisted', { value: false })
      window.dispatchEvent(event)

      expect(document.cookie).toContain('_ga=')
    })
  })

  describe('setupCookieComponentListeners', () => {
    let form
    let acceptButton
    let rejectButton
    let acceptedBanner
    let rejectedBanner
    let questionBanner
    let cookieBanner

    beforeEach(() => {
      FakeXHR.instances = []
      FakeXHR.mockImplementation(function () {
        this.open = jest.fn()
        this.setRequestHeader = jest.fn()
        this.send = jest.fn()
        FakeXHR.instances.push(this)
      })

      ;({ form, acceptButton, rejectButton, acceptedBanner, rejectedBanner, questionBanner, cookieBanner } = buildCookieBannerDom())

      setupCookies = loadCookiesModule()
      setupCookies()
    })

    it('should show the accepted banner and load analytics when accept is clicked', () => {
      acceptButton.click()

      expect(questionBanner.hasAttribute('hidden')).toBe(true)
      expect(acceptedBanner.hasAttribute('hidden')).toBe(false)
      expect(document.activeElement).toBe(acceptedBanner)

      const gtmScript = document.head.querySelector('script[src*="googletagmanager.com/gtm.js"]')
      expect(gtmScript.src).toContain('id=GTM-XXXX')

      expect(FakeXHR.instances).toHaveLength(1)
      const xhr = FakeXHR.instances[0]
      expect(xhr.open).toHaveBeenCalledWith('POST', '/cookies', true)
      expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json')
      expect(JSON.parse(xhr.send.mock.calls[0][0])).toEqual({
        analytics: true,
        async: true,
        crumb: 'crumb-token'
      })
    })

    it('should remove the tabindex from the accepted banner on blur', () => {
      acceptButton.click()

      acceptedBanner.setAttribute('tabindex', '-1')
      acceptedBanner.dispatchEvent(new window.Event('blur'))

      expect(acceptedBanner.hasAttribute('tabindex')).toBe(false)
    })

    it('should not resubmit the form when the preference request succeeds', () => {
      acceptButton.click()
      const xhr = FakeXHR.instances[0]
      xhr.status = 200

      xhr.onload()

      expect(form.submit).not.toHaveBeenCalled()
    })

    it('should submit the form as a fallback when the preference request returns an error status', () => {
      acceptButton.click()
      const xhr = FakeXHR.instances[0]
      xhr.status = 500

      xhr.onload()

      expect(form.submit).toHaveBeenCalled()
    })

    it('should submit the form as a fallback when the preference request errors', () => {
      acceptButton.click()
      const xhr = FakeXHR.instances[0]

      xhr.onerror()

      expect(form.submit).toHaveBeenCalled()
    })

    it('should show the rejected banner and delete GA cookies when reject is clicked', () => {
      document.cookie = '_ga=GA1.1.111;path=/'

      rejectButton.click()

      expect(questionBanner.hasAttribute('hidden')).toBe(true)
      expect(rejectedBanner.hasAttribute('hidden')).toBe(false)
      expect(document.cookie).not.toContain('_ga=')

      const xhr = FakeXHR.instances[0]
      expect(JSON.parse(xhr.send.mock.calls[0][0])).toEqual({
        analytics: false,
        async: true,
        crumb: 'crumb-token'
      })
    })

    it('should not resubmit the form when the reject preference request succeeds', () => {
      rejectButton.click()
      const xhr = FakeXHR.instances[0]
      xhr.status = 200

      xhr.onload()

      expect(form.submit).not.toHaveBeenCalled()
    })

    it('should hide the cookie banner when the accepted banner hide button is clicked', () => {
      acceptButton.click()
      acceptedBanner.querySelector('.js-hide').click()

      expect(cookieBanner.hasAttribute('hidden')).toBe(true)
    })

    it('should hide the cookie banner when the rejected banner hide button is clicked', () => {
      rejectButton.click()
      rejectedBanner.querySelector('.js-hide').click()

      expect(cookieBanner.hasAttribute('hidden')).toBe(true)
    })

    it('should load gtag analytics for a G- prefixed key', () => {
      document.body.innerHTML = ''
      const dom = buildCookieBannerDom('G-XXXX')
      setupCookies = loadCookiesModule()
      setupCookies()

      dom.acceptButton.click()

      const gtagScript = document.head.querySelector('script[src*="googletagmanager.com/gtag/js"]')
      expect(gtagScript.src).toContain('id=G-XXXX')
      expect(window.dataLayer.length).toBeGreaterThan(0)
    })

    it('should not load analytics for an invalid analytics key', () => {
      document.body.innerHTML = ''
      const dom = buildCookieBannerDom('not-a-valid-key')
      setupCookies = loadCookiesModule()
      setupCookies()

      dom.acceptButton.click()

      expect(document.head.querySelector('script[src*="googletagmanager.com"]')).toBeNull()
    })
  })
})
