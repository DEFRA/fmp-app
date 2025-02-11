const { config } = require('../../../config')
const { ApplicationCredentialsManager } = require('@esri/arcgis-rest-request')
const tokenDurationInMinutes = 7200 // 5 Days
const ONE_MINUTE_MS = 60000
const FIVE_SECONDS = 5000
let tokenExpiryTime
let appManagerInstance
let refreshTokenPromise

const setExpiryTime = () => {
  tokenExpiryTime = new Date(Date.now() + tokenDurationInMinutes * ONE_MINUTE_MS)
}

const isExpired = () => {
  const timestampNow = new Date() - 0
  const expired = tokenExpiryTime && timestampNow > tokenExpiryTime - FIVE_SECONDS
  return tokenExpiryTime && expired
}

const getExpiryDurationInMilliseconds = () => {
  return tokenExpiryTime - FIVE_SECONDS - Date.now()
}

// getAppManager is wrapped in a getter so it is initialised at 1st use, to stop test failures
// when it is initialised at include time.
const getAppManager = async () => {
  if (!appManagerInstance) {
    appManagerInstance = ApplicationCredentialsManager.fromCredentials({
      clientId: config.agol.clientId,
      clientSecret: config.agol.clientSecret,
      duration: tokenDurationInMinutes
    })
    setExpiryTime()
  }
  return await appManagerInstance
}

const refreshToken = async () => {
  // Saving refreshTokenPromise ensures that multple async requests dont all refresh the token
  if (refreshTokenPromise) {
    return refreshTokenPromise
  }
  const appManager = appManagerInstance
  refreshTokenPromise = appManager.refreshToken()
  const token = await refreshTokenPromise.then((token) => {
    refreshTokenPromise = undefined
    return token
  })
  setExpiryTime()
  return token
}

const getToken = async (forceRefresh) => {
  const appManager = await getAppManager()
  const expired = isExpired()

  if (!forceRefresh && appManager.token && !expired) {
    return appManager.token
  }
  const token = await refreshToken()
  return token
}

const getEsriToken = async (forceRefresh = false) => {
  const token = await getToken(forceRefresh)
  const expires = tokenExpiryTime
  const durationMs = getExpiryDurationInMilliseconds()
  return { token, expires, durationMs }
}

module.exports = { getEsriToken }
