const Boom = require('boom')
const QueryString = require('querystring')
const config = require('../../config')
const wreck = require('wreck')
const uuidv1 = require('uuid/v1')
const { getApplicationReferenceNumber } = require('../services/application-reference')
const publishToQueueURL = config.functionAppUrl + '/publish-queue'
const ContactViewModel = require('../models/contact-view')
const { polygon } = require('@turf/turf')
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const nameRegex = /[a-zA-Z][a-zA-Z ]+[a-zA-Z]$/
module.exports = [{
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
        var PDFinformationDetailsObject = { coordinates: { x: 0, y: 0 }, location: '', zoneNumber: '' }
        PDFinformationDetailsObject.coordinates.x = request.query.easting
        PDFinformationDetailsObject.coordinates.y = request.query.northing
        PDFinformationDetailsObject.polygon = request.query.polygon
        PDFinformationDetailsObject.cent = request.query.center
        PDFinformationDetailsObject.location = encodeURIComponent(request.query.location)
        PDFinformationDetailsObject.zoneNumber = encodeURIComponent(request.query.zoneNumber)
        if (recipientemail) {
          return h.view('contact', new ContactViewModel(
            {
              fullName: '',
              recipientemail: recipientemail,
              PDFinformationDetailsObject: PDFinformationDetailsObject
            }))
        }
        const model = new ContactViewModel({
          PDFinformationDetailsObject: PDFinformationDetailsObject
        }
        )
        return h.view('contact', model)
      } catch (err) {
        return Boom.badImplementation(err.message, err)
      }
    },
    validate: {
    }
  }
},
{
  method: 'POST',
  path: '/contact',
  options: {
    description: 'submits the page to Confirmation Screen',
    auth: {
      strategy: 'restricted'
    },
    handler: async (request, h) => {
      var correlationId = uuidv1()
      try {
        const payload = request.payload
        const applicationReferenceNumber = await getApplicationReferenceNumber()
        var PDFinformationDetailsObject = { coordinates: { x: 0, y: 0 }, applicationReferenceNumber: '', location: '', polygon: '', center: '', zoneNumber: '' }

        let model = {}
        const { recipientemail, fullName } = request.payload
        const isEmailFormatValid = emailRegex.test(recipientemail)
        const isNameFormatValid = nameRegex.test(fullName)
        if (recipientemail.trim() !== '' && isEmailFormatValid && fullName.trim() !== '' && isNameFormatValid) {
          if (payload && payload.easting && payload.northing) {
            PDFinformationDetailsObject.coordinates.x = payload.easting
            PDFinformationDetailsObject.coordinates.y = payload.northing
            PDFinformationDetailsObject.zoneNumber = payload.zoneNumber
            if (payload.polygon) {
              PDFinformationDetailsObject.polygon = '[' + payload.polygon + ']'
              PDFinformationDetailsObject.cent = payload.cent
            }
            if (!payload.location) {
              PDFinformationDetailsObject.location = payload.easting + ',' + payload.northing
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
          queryParams.zoneNumber = PDFinformationDetailsObject.zoneNumber
          queryParams.correlationId = correlationId
          queryParams.fullName = payload.fullName
          queryParams.polygon = payload.polygon
          queryParams.cent = PDFinformationDetailsObject.cent
          queryParams.zoneNumber = PDFinformationDetailsObject.zoneNumber

          const query = QueryString.stringify(queryParams)

          const { x, y } = PDFinformationDetailsObject.coordinates
          var { location, polygon } = PDFinformationDetailsObject
          const name = payload.fullName
          const recipientemail = payload.recipientemail
          const data = JSON.stringify({ name, recipientemail, x, y, polygon, location, applicationReferenceNumber })
          await wreck.post(publishToQueueURL, {
            payload: data
          })
          return h.redirect(`/confirmation?${query}`)
        } else if (recipientemail && recipientemail.trim() !== '' && isEmailFormatValid) {
          const errors = [{ text: 'Enter your full name', href: '#fullName' }]
          model = {}
          model = new ContactViewModel({
            errorSummary: errors,
            fullName: fullName,
            PDFinformationDetailsObject: {
              polygon: payload.polygon,
              cent: payload.cent,
              coordinates: {
                x: payload.easting,
                y: payload.northing
              },
              location: payload.location,
              zoneNumber: payload.zoneNumber
            },
            recipientemail: recipientemail,
            fullnameError: { text: 'Enter your full name' }
          })
        } else if (fullName && fullName.trim() !== '' && isNameFormatValid) {
          const errors = [{ text: 'Enter an email address in the correct format, like name@example.com', href: '#recipientemail' }]
          model = {}
          model = new ContactViewModel({
            errorSummary: errors,
            fullName: fullName,
            recipientemail: recipientemail,
            PDFinformationDetailsObject: {
              polygon: payload.polygon,
              cent: payload.cent,
              coordinates: {
                x: payload.easting,
                y: payload.northing
              },
              zoneNumber: payload.zoneNumber,
              location: payload.location
            },
            emailError: { text: 'Enter an email address in the correct format, like name@example.com' }
          })
        } else {
          const errors = [{ text: 'Enter your full name', href: '#fullName' },
            { text: 'Enter an email address in the correct format, like name@example.com', href: '#recipientemail' }
          ]
          model = {}
          model = new ContactViewModel({
            errorSummary: errors,
            fullName: fullName,
            recipientemail: recipientemail,
            PDFinformationDetailsObject: {
              polygon: payload.polygon,
              cent: payload.cent,
              coordinates: {
                x: payload.easting,
                y: payload.northing
              },
              location: payload.location,
              zoneNumber: payload.zoneNumber
            },
            emailError: { text: 'Enter an email address in the correct format, like name@example.com' },
            fullnameError: { text: 'Enter your full name' }
          })
        }
        return h.view('contact', model)
      } catch (error) {
      }
    }
  }
}]
