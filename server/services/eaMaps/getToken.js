const { config } = require('../../../config')
const axios = require('axios')

const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
const https = require('https')
const httpsAgent = new https.Agent({ keepAlive: true })

const cachedToken = {
  token: undefined,
  expires: undefined
}

// getToken should be wrapped in a try catch as refreshToken will throw
const getToken = async () => {
  if (cachedToken.token && cachedToken.expires > new Date()) {
    return cachedToken.token
  }
  // invalidate the cachedToken
  cachedToken.token = undefined
  cachedToken.expires = undefined

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

  const response = await axios.post(tokenUrl, formData, { headers, httpsAgent })
  const { status, data } = response

  if (status === 200) {
    const { token, expires, error } = data
    console.log('token', token)
    if (error) {
      const errorMessage = 'An error was returned attempting to get an EA Maps esri token'
      console.log(errorMessage, JSON.stringify(error))
      throw (new Error(errorMessage))
    }
    // Now save the token and expiry time
    cachedToken.token = token
    cachedToken.expires = expires
  } else {
    const errorMessage = 'There was an error requesting an EA Maps esri token'
    console.log(errorMessage, data)
    throw (new Error(errorMessage))
  }
}

module.exports = { getToken }
