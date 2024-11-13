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

// https://eaflooddigitalservices.cloud.esriuk.com/server/rest/services/FMfP/FMFPGetProduct1/GPServer/fmfp_get_product1/execute

// 'geometry=%7B%22rings%22%3A%5B%5B%5B479602%2C484076%5D%2C%5B479607%2C484033%5D%2C%5B479674%2C484040%5D%2C%5B479682%2C484098%5D%2C%5B479602%2C484076%5D%5D%5D%2C%22spatialReference%22%3A%7B%22wkid%22%3A27700%7D%7D&referenceNumber=&scale=2500&product=1&token=Xpcd58n6vysMC3iCKBBLte9hp95FlIZVAFMBkVm2_NmwrZjJ4t6MZSelGW-VeYNJ0WjdNcCOY_WutcdEYbu6jDzP2IMLqm1sFpmKlRTHNtM.'
// 'geometry=%7B%22rings%22%3A%5B%5B%5B479602%2C484076%5D%2C%5B479607%2C484033%5D%2C%5B479674%2C484040%5D%2C%5B479682%2C484098%5D%2C%5B479602%2C484076%5D%5D%5D%2C%22spatialReference%22%3A%7B%22wkid%22%3A27700%7D%7D&referenceNumber=&scale=2500&product=1&token=Xpcd58n6vysMC3iCKBBLte9hp95FlIZVAFMBkVm2_NmCVXeh7iS0dF3SzXKV5Zea8GOl5P-uXZExBy5gE7wmMv0NrRi29APQAoLT_zuUMnk.'

const getProduct1 = async (polygon, referenceNumber = 'X', scale, holdingComments) => {
  try {
    const token = await getToken()
    const pdfUrl = config.eamaps.serviceUrl + config.eamaps.product1EndPoint
    console.log('pdfUrl', pdfUrl)
    const geometry = JSON.stringify(makePolygonGeometry(polygon))

    const formData = {
      geometry,
      referenceNumber,
      scale,
      product: '1',
      f: 'json',
      token
    }
    console.dir(formData, { depth: null })

    const response = await axios.post(pdfUrl, formData, {
      httpsAgent,
      headers
    })
    console.log('response.request._header:\n', response.request._header)
    const { data } = response
    console.log('data', data)
    const { results } = data
    console.log('results', results)

    if (results) {
      const { value: { url } } = results[0]
      console.log('url', url)

      const response = await axios.get(url, {
        httpsAgent,
        responseType: 'stream'
      })
      // console.log('response from blob request', response)
      const { data: pdfData } = response
      // console.log('pdfData', pdfData)
      return pdfData
    } else {
      throw new Error(data)
    }
  } catch (error) {
    console.log('caught error', error)
  }
}

module.exports = { getProduct1 }
