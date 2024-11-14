const { config } = require('../../../config')
const axios = require('axios')
const headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Accept-Encoding': 'gzip, deflate, br'
}
const { makePolygonGeometry } = require('../agol')
const { getToken } = require('./getToken')

const parseEaMapsProduct1Response = (response) => {
  const { data } = response
  const { results } = data

  if (!results || !Array.isArray(results)) {
    const message = 'unexpected results from eaMaps generate pdf'
    console.log(message, results)
    throw new Error(message)
  }

  return results.reduce((response, resultEntry) => {
    const { paramName, value } = resultEntry
    if (paramName === 'pdfFile') {
      response.url = (value && value.url) || undefined
    } else if (paramName === 'error') {
      response.error = value
    }
    return response
  }, { url: undefined, error: undefined })
}

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
    console.log('\n\npdfUrl', pdfUrl)
    // 1st post the data, which triggers the EAMaps process to produce a temporary pdf
    // and returns the url of that pdf
    const response = await axios.post(pdfUrl, formData, {
      headers
    })

    const { url, error } = parseEaMapsProduct1Response(response)

    if (error) {
      console.log('An error was returned from the eaMaps Product 1 service', error)
      throw (error)
    } else if (!url) {
      const message = 'The eaMaps Product 1 service failed to return a url'
      console.log(message)
      throw new Error(message)
    }

    // Now fetch and return the actual pdf stream using the returned url
    const pdfStreamResponse = await axios.get(url, {
      responseType: 'stream'
    })

    const { data: pdfData } = pdfStreamResponse
    return pdfData
  } catch (error) {
    console.log('Error caught in getProduct1', error)
    throw (error)
  }
}

module.exports = { getProduct1 }
