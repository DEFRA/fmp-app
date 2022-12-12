const Boom = require('@hapi/boom')
const ApplicationReviewSummaryViewModel = require('../models/check-your-details')
const { getApplicationReferenceNumber } = require('../services/application-reference')
const config = require('../../config')
const wreck = require('@hapi/wreck')
const publishToQueueURL = config.functionAppUrl + '/publish-queue'
const { getAreaInHectares } = require('../services/shape-utils')
module.exports = [
  {
    method: 'GET',
    path: '/check-your-details',
    options: {
      description: 'Application Review Summary',
      handler: async (request, h) => {
        const payload = request.query
        const PDFinformationDetailsObject = { coordinates: { x: 0, y: 0 }, applicationReferenceNumber: '', location: '', polygon: '', center: '', zoneNumber: '', fullName: '', recipientemail: '', contacturl: '' }
        const { recipientemail, fullName } = payload
        if (payload.easting && payload.northing) {
          PDFinformationDetailsObject.coordinates.x = payload.easting
          PDFinformationDetailsObject.coordinates.y = payload.northing
          if (payload.zoneNumber) {
            PDFinformationDetailsObject.zoneNumber = payload.zoneNumber
          }
          if (payload.polygon) {
            PDFinformationDetailsObject.polygon = payload.polygon
            PDFinformationDetailsObject.cent = payload.center
          }
          if (!payload.location) {
            PDFinformationDetailsObject.location = payload.easting + ',' + payload.northing
          } else {
            PDFinformationDetailsObject.location = payload.location
          }
          PDFinformationDetailsObject.applicationReferenceNumber = ''
        } else {
          return Boom.badImplementation('Query parameters are empty')
        }
        if (fullName) {
          PDFinformationDetailsObject.fullName = fullName
        } else {
          return Boom.badImplementation('fullName is Empty')
        }
        if (recipientemail) {
          PDFinformationDetailsObject.recipientemail = recipientemail
        } else {
          return Boom.badImplementation('RecipientEmail is Empty')
        }
        const model = new ApplicationReviewSummaryViewModel({
          PDFinformationDetailsObject,
          contacturl: `/contact?easting=${PDFinformationDetailsObject.coordinates.x}&northing=${PDFinformationDetailsObject.coordinates.y}&zone=${PDFinformationDetailsObject.zoneNumber}&polygon=${PDFinformationDetailsObject.polygon}&center${PDFinformationDetailsObject.cent}&location=${PDFinformationDetailsObject.location}&zoneNumber=${PDFinformationDetailsObject.zoneNumber}&fullName=${PDFinformationDetailsObject.fullName}&recipientemail=${PDFinformationDetailsObject.recipientemail}`,
          confirmlocationurl: `confirm-location?easting=${PDFinformationDetailsObject.coordinates.x}&northing=${PDFinformationDetailsObject.coordinates.y}&placeOrPostcode=${PDFinformationDetailsObject.location}&fullName=${PDFinformationDetailsObject.fullName}&recipientemail=${PDFinformationDetailsObject.recipientemail}`
        })
        return h.view('check-your-details', model)
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
          const applicationReferenceNumber = await getApplicationReferenceNumber()
          const PDFinformationDetailsObject = { coordinates: { x: 0, y: 0 }, applicationReferenceNumber: '', location: '', polygon: '', center: '', zoneNumber: '' }
          const { recipientemail, fullName, zoneNumber } = payload
          // Sanitise user inputs
          if (payload.easting && payload.northing) {
            PDFinformationDetailsObject.coordinates.x = payload.easting
            PDFinformationDetailsObject.coordinates.y = payload.northing
            if (zoneNumber) {
              PDFinformationDetailsObject.zoneNumber = zoneNumber
            }
            if (payload.polygon) {
              PDFinformationDetailsObject.polygon = '[' + payload.polygon + ']'
              PDFinformationDetailsObject.cent = payload.cent
            }
            if (!payload.location) {
              PDFinformationDetailsObject.location = payload.easting + ',' + payload.northing
            } else {
              PDFinformationDetailsObject.location = payload.location
            }
            PDFinformationDetailsObject.applicationReferenceNumber = applicationReferenceNumber
          }

          // Send details to function app
          const { x, y } = PDFinformationDetailsObject.coordinates
          const { location, polygon } = PDFinformationDetailsObject
          const plotSize = getAreaInHectares(payload.polygon)
          const name = fullName
          const psoResults = await request.server.methods.getPsoContacts(x, y)
          const data = JSON.stringify({
            name,
            recipientemail,
            x,
            y,
            polygon,
            location,
            applicationReferenceNumber,
            zoneNumber,
            areaName: psoResults.AreaName,
            psoEmailAddress: psoResults.EmailAddress,
            plotSize,
            task: 'LOG_REQUEST'
          })
          wreck.post(publishToQueueURL, {
            payload: data
          })

          // Forward details to confirmation page
          const queryParams = {}
          queryParams.fullName = payload.fullName || ''
          queryParams.polygon = payload.polygon || ''
          queryParams.recipientemail = payload.recipientemail || ''
          queryParams.applicationReferenceNumber = applicationReferenceNumber
          queryParams.x = PDFinformationDetailsObject.coordinates.x
          queryParams.y = PDFinformationDetailsObject.coordinates.y
          queryParams.location = PDFinformationDetailsObject.location
          queryParams.zoneNumber = PDFinformationDetailsObject.zoneNumber
          queryParams.cent = payload.cent || ''

          // During serializing, the UTF-8 encoding format is used to encode any character that requires percent-encoding.
          const query = new URLSearchParams(queryParams).toString()
          return h.redirect(`/confirmation?${query}`)
        } catch (error) {
        }
      }
    }
  }]
