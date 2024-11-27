const { config } = require('../../../config')

const https = require('https')
const querystring = require('querystring')

const getOsToken = async () => {
  const { osClientId, osClientSecret } = config.ordnanceSurvey
  const postData = querystring.stringify({
    grant_type: 'client_credentials',
    client_id: osClientId,
    client_secret: osClientSecret
  })

  const options = {
    method: 'POST',
    host: 'api.os.uk',
    path: '/oauth2/token/v1',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      res.setEncoding('utf8')
      res.on('data', data => {
        resolve(data)
      })
    })

    req.on('error', error => {
      reject(error)
    })

    req.write(postData)
    req.end()
  })
}

module.exports = { getOsToken }
