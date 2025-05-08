const { esriRequest } = require('./esriRequest')

const esriFeatureRequest = async (endPoint, geometry, geometryType, optionalParams = { returnGeometry: 'false' }) => {
  const params = {
    ...optionalParams,
    outFields: '*'
  }
  return (await esriRequest(endPoint, geometry, geometryType, params)).features
}

module.exports = { esriFeatureRequest }
