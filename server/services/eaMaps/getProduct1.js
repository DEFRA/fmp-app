const { config } = require('../../../config')
const axios = require('axios')
const headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Accept-Encoding': 'gzip, deflate, br'
}
const { makePolygonGeometry } = require('../agol')
const { getToken } = require('./getToken')
const https = require('https')
const httpsAgent = new https.Agent({ keepAlive: true })

const getProduct1 = async (polygon, referenceNumber = 'X', scale, _holdingComments) => {
  try {
    const token = await getToken()
    const pdfUrl = config.eamaps.serviceUrl + config.eamaps.product1EndPoint
    const geometry = JSON.stringify(makePolygonGeometry(polygon))
    // _holdingComments is awaiting an implementation for FMP2

    const formData = {
      geometry,
      referenceNumber,
      scale,
      product: '1',
      f: 'json',
      token
    }

    const response = await axios.post(pdfUrl, formData, {
      httpsAgent,
      headers
    })

    const { data } = response

    const { results } = data

    if (results) {
      const { value: { url } } = results[0]

      const response = await axios.get(url, {
        httpsAgent,
        responseType: 'stream'
      })

      const { data: pdfData } = response
      return pdfData
    } else {
      throw new Error(data)
    }
  } catch (error) {
    console.log('caught error', error)
  }
}

module.exports = { getProduct1 }
