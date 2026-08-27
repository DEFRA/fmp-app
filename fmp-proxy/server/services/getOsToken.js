const { config } = require('../config')
const FIVE_SECONDS = 5000

let cachedToken
let cachedExpiry = 0

const getExpiry = (expiresInSeconds) => {
  const now = Date.now()
  const ttlSeconds = Math.max(1, Number(expiresInSeconds))
  return now + (ttlSeconds * 1000)
}

const isExpired = () => {
  const timestampNow = Date.now()
  const expired = cachedExpiry && timestampNow > cachedExpiry - FIVE_SECONDS
  return expired
}

const fetchOsToken = async () => {
  const credentials = Buffer.from(`${config.ordnanceSurvey.osClientId}:${config.ordnanceSurvey.osClientSecret}`).toString('base64')

  const response = await fetch(config.ordnanceSurvey.tokenUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`OS token request failed with ${response.status}: ${body}`)
  }

  return response.json()
}

const getOsToken = async () => {
  if (cachedToken && !isExpired()) {
    return cachedToken
  }

  const payload = await fetchOsToken()
  cachedToken = payload
  cachedExpiry = getExpiry(payload.expires_in)
  return cachedToken
}

module.exports = {
  getOsToken,
  _resetCache: () => {
    cachedToken = null
    cachedExpiry = 0
  }
}
