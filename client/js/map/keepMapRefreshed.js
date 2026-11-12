const REFRESH_INTERVAL_MS = 600000 // 10 minutes in milliseconds

export const keepMapRefreshed = () => {
  const refresh = async () => {
    try {
      await fetch('/map/refresh', { cache: 'no-store', credentials: 'same-origin' })
    } catch (error) {
      console.log('fmp refresh failed', error)
    }
  }
  setInterval(refresh, REFRESH_INTERVAL_MS)
}
