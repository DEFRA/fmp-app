const { ApplicationCredentialsManager } = require('@esri/arcgis-rest-request')
const { config } = require('../config')

const ONE_MINUTE_MS = 60000
const FIVE_SECONDS = 5000

let tokenExpiryTime
let appManagerInstance
let refreshTokenPromise

const setExpiryTime = () => {
  tokenExpiryTime = new Date(Date.now() + config.agol.tokenDurationInMinutes * ONE_MINUTE_MS)
}

const isExpired = () => {
  const timestampNow = Date.now()
  const expired = tokenExpiryTime && timestampNow > tokenExpiryTime - FIVE_SECONDS
  return tokenExpiryTime && expired
}

const getAppManager = async () => {
  if (!appManagerInstance) {
    appManagerInstance = ApplicationCredentialsManager.fromCredentials({
      clientId: config.agol.clientId,
      clientSecret: config.agol.clientSecret,
      duration: config.agol.tokenDurationInMinutes
    })
    setExpiryTime()
  }
  return appManagerInstance
}

const refreshToken = async () => {
  if (refreshTokenPromise) {
    return refreshTokenPromise
  }

  const appManager = appManagerInstance
  refreshTokenPromise = appManager.refreshToken()
  const token = await refreshTokenPromise.then((refreshedToken) => {
    refreshTokenPromise = null
    return refreshedToken
  })
  setExpiryTime()

  return token
}

const getToken = async (forceRefresh) => {
  const appManager = await getAppManager()

  if (!forceRefresh && appManager.token && !isExpired()) {
    return appManager.token
  }

  return refreshToken()
}

const getEsriToken = async (forceRefresh = false) => {
  const token = await getToken(forceRefresh)
  return { token, expires: tokenExpiryTime }
}

module.exports = {
  getEsriToken,
  _resetCache: () => {
    tokenExpiryTime = undefined
    appManagerInstance = undefined
    refreshTokenPromise = undefined
  }
}
