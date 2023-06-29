const util = require('../util')
const config = require('../../config')
const url = config.service + '/surface-water-by-polygon?polygon='

/* Example response: {
    "low_surface_water_ratio": 0.066418956268866,
    "medium_surface_water_ratio": 0.121275868802545,
    "high_surface_water_ratio": 0.143741797721191,
    "maximum_surface_water_risk": "High",
    "surface_water_suitability": "County to Town",
    "extra_info": null
  }
*/

const ratioToPercent = (val = 0) => Math.round(val * 1000) / 10

const transformSurfaceWater = async (response) => {
  return {
    surfaceWaterResponse: true,
    lowRatio: ratioToPercent(response.low_surface_water_ratio),
    mediumRatio: ratioToPercent(response.medium_surface_water_ratio),
    highRatio: ratioToPercent(response.high_surface_water_ratio),
    maximumRisk: response.maximum_surface_water_risk,
    suitability: response.surface_water_suitability,
    extraInfo: response.extra_info
  }
}

const getSurfaceWaterByPolygon = polygon => {
  try {
    const geoJsonPolygon = util.convertToGeoJson(polygon)
    const myurl = url + geoJsonPolygon
    return util.getJson(myurl)
      .then(transformSurfaceWater)
      .catch((error) => {
        console.log('\n\ngetSurfaceWaterByPolygon ERROR 1 \n', error)
        return { surfaceWaterResponse: false }
      })
  } catch (error) {
    throw new Error('getSurfaceWaterByPolygon failed: ', error)
  }
}

const expiresIn = 600000 // 10 minutes
const staleIn = 540000 // 9 minutes
const generateTimeout = 10000 // 10 seconds
const staleTimeout = 59000 // 59 seconds

module.exports = {
  name: 'getSurfaceWaterByPolygon',
  method: getSurfaceWaterByPolygon,
  options: {
    cache: {
      cache: 'FMFP', expiresIn, staleIn, generateTimeout, staleTimeout
    },
    generateKey: polygon => JSON.stringify(polygon)
  }
}
