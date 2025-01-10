// const Boom = require('@hapi/boom')
// const ApplicationReviewSummaryViewModel = require('../models/check-your-details')
const { config } = require('../../config')
const wreck = require('@hapi/wreck')
const publishToQueueURL = config.functionAppUrl + '/order-product-four'
const { getAreaInHectares, getCentreOfPolygon } = require('../services/shape-utils')
const addressService = require('../services/address')
const { polygon: TurfPolygon, centroid } = require('@turf/turf')
const functionAppRequests = {}

const getFunctionAppResponse = async (referer, data) => {
  if (referer && functionAppRequests[referer]) {
    return functionAppRequests[referer]
  }
  const payload = JSON.parse(data)
  const postcode = await addressService.getPostcodeFromEastingorNorthing(
    payload?.x,
    payload?.y
  )
  payload.postcode = postcode

  const functionAppResponse = wreck.post(publishToQueueURL, {
    payload: JSON.stringify(payload)
  })
  if (!referer) {
    return functionAppResponse
  }
  functionAppRequests[referer] = functionAppResponse
  setTimeout(() => {
    // delete the saved response after 60 seconds
    delete functionAppRequests[referer]
  }, 60000)
  return functionAppRequests[referer]
}

const floodZoneResultsToFloodZone = (floodZoneResults) =>
  floodZoneResults.floodzone_3 ? '3' : floodZoneResults.floodzone_2 ? '2' : '1'

module.exports = [
  {
    method: 'GET',
    path: '/check-your-details',
    options: {
      description: 'Application Review Summary',
      handler: async (request, h) => {
        const { polygon, fullName, recipientemail } = request.query
        const floodZoneResults = await request.server.methods.getFloodZonesByPolygon(polygon)
        const floodZone = floodZoneResultsToFloodZone(floodZoneResults)
        const contactUrl = `/contact?polygon=${polygon}&fullName=${fullName}&recipientemail=${recipientemail}`
        const confirmLocationUrl = `confirm-location?fullName=${fullName}&recipientemail=${recipientemail}`
        return h.view('check-your-details', { polygon, fullName, recipientemail, contactUrl, confirmLocationUrl, floodZone })
      }
    }
  },
  {
    method: 'POST',
    path: '/check-your-details',
    options: {
      description: 'submits the page to Confirmation Screen',
      handler: async (request, h) => {
        try {
          const payload = request.payload || {}
          const { recipientemail, fullName, zoneNumber } = payload
          const coordinates = getCentreOfPolygon(payload.polygon)

          const PDFinformationDetailsObject = {
            coordinates,
            applicationReferenceNumber: '',
            location: '',
            polygon: '[' + payload.polygon + ']',
            center: '',
            zoneNumber: ''
          }
          const easting = centre.x
          const northing = centre.y
          PDFinformationDetailsObject.coordinates.x = easting
          PDFinformationDetailsObject.coordinates.y = northing
          if (zoneNumber) {
            PDFinformationDetailsObject.zoneNumber = zoneNumber
          }
          if (payload.polygon) {
            PDFinformationDetailsObject.polygon = '[' + payload.polygon + ']'
            PDFinformationDetailsObject.cent = payload.cent
          }
          if (!payload.location) {
            PDFinformationDetailsObject.location = easting + ',' + northing
          } else {
            PDFinformationDetailsObject.location = payload.location
          }
          // }

          // Send details to function app
          const { x, y } = PDFinformationDetailsObject.coordinates
          const { location, polygon } = PDFinformationDetailsObject
          const plotSize = getAreaInHectares(payload.polygon)
          const name = fullName
          const psoResults = await request.server.methods.getPsoContactsByPolygon(payload.polygon)
          const floodZoneResults = await request.server.methods.getFloodZonesByPolygon(payload.polygon)
          const data = JSON.stringify({
            name,
            recipientemail,
            x,
            y,
            polygon,
            location,
            zoneNumber: floodZoneResultsToFloodZone(floodZoneResults),
            plotSize,
            areaName: psoResults.AreaName,
            psoEmailAddress: psoResults.EmailAddress,
            llfa: psoResults.LocalAuthorities || ''
          })
          const queryParams = {}

          try {
            const referer = request.headers ? request.headers.referer : undefined
            // TODO - reinstate this request
            const result = await getFunctionAppResponse(referer, data)
            const response = result.payload.toString()
            const { applicationReferenceNumber } = JSON.parse(response)
            queryParams.applicationReferenceNumber = applicationReferenceNumber
          } catch (error) {
            console.log(
              '\nFailed to POST these data to the functionsApp /order-product-four:\n',
              data
            )
            console.log('Error\n', JSON.stringify(error))
            const redirectURL = `/order-not-submitted?polygon=${payload?.polygon}&center=[${payload?.easting},${payload?.northing}]&location=${PDFinformationDetailsObject?.location}`
            return h.redirect(redirectURL)
          }

          // Forward details to confirmation page
          queryParams.fullName = payload.fullName || ''
          queryParams.polygon = payload.polygon || ''
          queryParams.recipientemail = payload.recipientemail || ''
          queryParams.x = PDFinformationDetailsObject.coordinates.x
          queryParams.y = PDFinformationDetailsObject.coordinates.y
          queryParams.location = PDFinformationDetailsObject.location
          queryParams.zoneNumber = PDFinformationDetailsObject.zoneNumber
          queryParams.cent = payload.cent || ''

          // During serializing, the UTF-8 encoding format is used to encode any character that requires percent-encoding.
          const query = new URLSearchParams(queryParams).toString()
          return h.redirect(`/confirmation?${query}`)
        } catch (error) {}
      }
    }
  }
]
