const Boom = require('boom')
const ContactAndPDFInformationObjectViewModel = require('../models/contact-and-pdf-information-view')
const QueryString = require('querystring')
const config = require('../../config')
const wreck = require('wreck')
const uuidv1 = require('uuid/v1')
const { getApplicationReferenceNumber } = require('../services/application-reference')
const publishToQueueURL = config.functionAppUrl + '/publish-queue'

module.exports = [
  {
    method: 'GET',
    path: '/contact',
    options: {
      description: 'Get contact details page for product 4',
      auth: {
        strategy: 'restricted'
      },
      handler: async (request, h) => {
        try {
          const recipientemail = request.query.recipientemail
          var PDFinformationDetailsObject = { coordinates: { x: 0, y: 0 }, location: '' }
          PDFinformationDetailsObject.coordinates.x = request.query.eastings
          PDFinformationDetailsObject.coordinates.y = request.query.northing
          PDFinformationDetailsObject.location = encodeURIComponent(request.query.location)
          if (recipientemail) {
            return h.view('contact', new ContactAndPDFInformationObjectViewModel(
              {
                fullName: '',
                recipientemail: recipientemail,
                PDFinformationDetailsObject: PDFinformationDetailsObject
              }))
          }
          const model = new ContactAndPDFInformationObjectViewModel({
            PDFinformationDetailsObject: PDFinformationDetailsObject
          }
          )
          return h.view('contact', model)
        } catch (err) {
          return Boom.badImplementation(err.message, err)
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/contact',
    options: {
      auth: {
        strategy: 'restricted'
      },
      handler: async (request, h) => {
        var correlationId = uuidv1()
        try {
          const payload = request.payload
          const applicationReferenceNumber = await getApplicationReferenceNumber()
          var PDFinformationDetailsObject = { coordinates: { x: 0, y: 0 }, applicationReferenceNumber: '' }
          if (payload && payload.eastings && payload.northing) {
            PDFinformationDetailsObject.coordinates.x = payload.eastings
            PDFinformationDetailsObject.coordinates.y = payload.northing
            if (!payload.location) {
              PDFinformationDetailsObject.location = payload.eastings + ',' + payload.northing
            } else {
              PDFinformationDetailsObject.location = decodeURIComponent(payload.location)
            }
            PDFinformationDetailsObject.applicationReferenceNumber = applicationReferenceNumber
          } else {
            return Boom.badImplementation('Query parameters are empty')
          }
          const queryParams = {}
          queryParams.recipientemail = payload.recipientemail
          queryParams.applicationReferenceNumber = applicationReferenceNumber
          queryParams.x = PDFinformationDetailsObject.coordinates.x
          queryParams.y = PDFinformationDetailsObject.coordinates.y
          queryParams.location = PDFinformationDetailsObject.location
          queryParams.correlationId = correlationId
          queryParams.fullName = payload.fullName
          const query = QueryString.stringify(queryParams)

          const { x, y } = PDFinformationDetailsObject.coordinates
          var { location } = PDFinformationDetailsObject
          const name = payload.fullName
          const recipientemail = payload.recipientemail
          const data = JSON.stringify({ name, recipientemail, x, y, location, applicationReferenceNumber })
          await wreck.post(publishToQueueURL, {
            payload: data
          })
          return h.redirect(`/confirmation?${query}`)
        } catch (err) {
          return Boom.badImplementation(err.message, err)
        }
      }
    }
  }]
