// Stageprompt 2.0.1
//
// See: https://github.com/alphagov/stageprompt
//
// Stageprompt allows user journeys to be described and instrumented
// using data attributes.
//
// Setup (run this on document ready):
//
//   GOVUK.performance.stageprompt.setupForGoogleAnalytics();
//
// Usage:
//
//   Sending events on page load:
//
//     <div id="wrapper" class="service" data-journey="pay-register-birth-abroad:start">
//         [...]
//     </div>
//
//   Sending events on click:
//
//     <a class="help-button" href="#" data-journey-click="stage:help:info">See more info...</a>

(function (global) {
  'use strict'

  const GOVUK = global.GOVUK || {}

  GOVUK.performance = GOVUK.performance || {}

  GOVUK.performance.stageprompt = (function () {
    const splitAction = function (action) {
      const parts = action.split(':')
      if (parts.length <= 3) {
        return parts
      }
      return [parts.shift(), parts.shift(), parts.join(':')]
    }

    const setup = function (analyticsCallback, element = document) {
      // Send an analytics event for all elements with the data-journey attrib
      element.querySelectorAll('[data-journey]').forEach((journeyElement) => {
        const analyticsObject = JSON.parse(journeyElement.dataset.journey)
        analyticsCallback(analyticsObject)
      })

      // Add a click handler to all elements with the data-analytics-click attrib
      element.querySelectorAll('[data-analytics-click]').forEach((journeyHelper) =>
        journeyHelper.addEventListener('click', () => {
          const analyticsObject = JSON.parse(journeyHelper.dataset.analyticsClick)
          analyticsCallback(analyticsObject)
        })
      )

      // Add a click handler to all elements with the data-journey-click attrib
      element
        .querySelectorAll('[data-journey-click]')
        .forEach((journeyHelper) =>
          journeyHelper.addEventListener('click', () =>
            analyticsCallback.apply(null, splitAction(journeyHelper.dataset.journeyClick))
          )
        )
    }

    const setupForGoogleAnalytics = function (element = document) {
      setup(GOVUK.performance.sendGoogleAnalyticsEvent, element)
    }

    return {
      setup,
      setupForGoogleAnalytics
    }
  })()

  GOVUK.performance.sendGoogleAnalyticsEvent = function (pageName, event, destination) {
    if (!document.cookie.match('GA=Accept')) {
      return // FCRM-3657 ensure we dont send analytics cookies if cookies are not accepted
    }
    if (window.gtag && typeof window.gtag === 'function') {
      if (pageName && pageName.event) {
        // IF this is a data-journey or data-analytics-click object, this will pass
        const { event, parameters = {} } = pageName
        window.gtag('event', event, parameters)
      } else {
        // This is a data-journey-click
        window.gtag('event', event, {
          PAGE_NAME: pageName,
          DESTINATION: destination
        })
      }
    }
  }

  global.GOVUK = GOVUK
})(window)
