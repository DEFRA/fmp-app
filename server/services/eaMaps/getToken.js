const { config } = require('../../../config')
const axios = require('axios')

const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
const https = require('https')
const httpsAgent = new https.Agent({ keepAlive: true })

const cachedToken = {
  token: undefined,
  expires: undefined
}

// invalidateToken is exported for unit tests
const invalidateToken = () => {
  cachedToken.token = undefined
  cachedToken.expires = undefined
}

// getToken should be wrapped in a try catch as refreshToken will throw
const getToken = async () => {
  if (cachedToken.token && cachedToken.expires > new Date()) {
    return cachedToken.token
  }
  invalidateToken()
  await refreshToken()
  return cachedToken.token
}

const refreshToken = async () => {
  const tokenUrl = config.eamaps.serviceUrl + config.eamaps.tokenEndPoint
  const formData = {
    username: config.eamaps.product1User,
    password: config.eamaps.product1Password,
    ip: null,
    client: null,
    f: 'json',
    expiration: 60
  }

  try {
    const response = await axios.post(tokenUrl, formData, { headers, httpsAgent })
    const { data } = response

    const { token, expires, error } = data
    if (error) {
      const errorMessage = 'An error was returned attempting to get an EA Maps esri token'
      console.log(errorMessage, JSON.stringify(error))
      throw (new Error(errorMessage))
    }
    // Now save the token and expiry time
    cachedToken.token = token
    cachedToken.expires = expires
  } catch (error) {
    console.log('There was an error requesting an EA Maps esri token')
    throw (error)
  }
}

module.exports = { getToken, invalidateToken }
