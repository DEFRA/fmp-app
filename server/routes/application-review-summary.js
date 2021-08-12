const Boom = require('boom')
const ApplicationReviewSummaryViewModel = require('../models/application-review-summary')

module.exports = [
  {
    method: 'GET',
    path: '/application-review-summary',
    options: {
      description: 'Application Review Summary',
      handler: async (request, h) => {
        const payload = request.query
        var PDFinformationDetailsObject = { coordinates: { x: 0, y: 0 }, applicationReferenceNumber: '', location: '', polygon: '', center: '', zoneNumber: '', fullName: '', recipientemail: '', contacturl: '' }
        const { recipientemail, fullName } = payload
        if (payload && payload.x && payload.y) {
          PDFinformationDetailsObject.coordinates.x = payload.x
          PDFinformationDetailsObject.coordinates.y = payload.y
          if (payload.zoneNumber) {
            PDFinformationDetailsObject.zoneNumber = payload.zoneNumber
          }
          if (payload.polygon) {
            PDFinformationDetailsObject.polygon = JSON.parse(payload.polygon)
            PDFinformationDetailsObject.cent = JSON.parse(payload.cent)
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
        var model = new ApplicationReviewSummaryViewModel({
          PDFinformationDetailsObject: PDFinformationDetailsObject,
          contacturl: `/contact?easting=${PDFinformationDetailsObject.coordinates.x}&northing=${PDFinformationDetailsObject.coordinates.y}&zone=${PDFinformationDetailsObject.zoneNumber}&polygon=${PDFinformationDetailsObject.polygon}&center${PDFinformationDetailsObject.cent}&location=${PDFinformationDetailsObject.location}&zoneNumber=${PDFinformationDetailsObject.zoneNumber}`,
          confirmlocationurl: `confirm-location?easting=${PDFinformationDetailsObject.coordinates.x}&northing=${PDFinformationDetailsObject.coordinates.y}&placeOrPostcode=${PDFinformationDetailsObject.location}`
               })
        return h.view('application-review-summary', model)
      }
    }
  },
  {
    method: 'POST',
    path: '/application-review-summary',
    options: {
      description: 'Application Review Summary',
      handler: async (request, h) => {
        try {
          return h.redirect('confirmation')
        } catch (err) {
        }
      }
    }
  }
]
