const REFRESH_INTERVAL_MS = 600000 // 10 minutes in milliseconds

export const keepMapRefreshed = () => {
  const refresh = async () => {
    try {
      const response = await fetch('/map/refresh', { cache: 'no-store', credentials: 'same-origin' })
      if (!response.ok) {
        console.log('fmp refresh failed', response.status)
      }
    } catch (error) {
      console.log('fmp refresh failed', error)
    }
  }
  setInterval(refresh, REFRESH_INTERVAL_MS)
  // Timers are paused or throttled while the device sleeps or the tab is hidden,
  // so refresh straight away when the page becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      refresh()
    }
  })
}
