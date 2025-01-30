const { config } = require('../../../config')
const { ApplicationCredentialsManager } = require('@esri/arcgis-rest-request')

const tokenDurationInMinutes = 7200 // 5 Days
// const tokenDurationInMinutes = 1
const ONE_MINUTE_MS = 60000
const FIVE_SECONDS = 5000
let tokenExpiryTime
let appManagerInstance
let refreshTokenPromise

const setExpiryTime = () => {
  tokenExpiryTime = new Date(Date.now() + tokenDurationInMinutes * ONE_MINUTE_MS)
}

const isExpired = () => {
  return tokenExpiryTime && Date.now() > tokenExpiryTime - FIVE_SECONDS
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
  const token = await refreshTokenPromise
  setExpiryTime()
  return token
}

const getEsriToken = async () => {
  const appManager = await getAppManager()
  const expired = isExpired()

  if (appManager.token && !expired) {
    refreshTokenPromise = undefined
    return appManager.token
  }
  const token = await refreshToken()
  return token
}

module.exports = { getEsriToken }
