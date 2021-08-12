const Boom = require('boom')
const QueryString = require('querystring')
const ContactViewModel = require('../models/contact-view')
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const nameRegex = /[a-zA-Z][a-zA-Z ]+[a-zA-Z]$/

class ContactViewErrorObject {
  constructor (fullName, recipientemail, payload, errorSummarArray) {
    this.fullName = fullName
    this.PDFinformationDetailsObject = {
      polygon: payload.polygon,
      cent: payload.cent,
      coordinates: {
        x: payload.easting,
        y: payload.northing
      },
      location: payload.location,
      zoneNumber: payload.zoneNumber
    },
    this.recipientemail = recipientemail,
    this.errorSummary = errorSummarArray
  }
}
const emailErrorMessage = { text: 'Enter an email address in the correct format, like name@example.com', href: '#recipientemail' }
const fullNameErrorMessage = { text: 'Enter your full name', href: '#fullName' }

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
          const PDFinformationDetailsObject = { coordinates: { x: 0, y: 0 }, location: '', zoneNumber: '', polygon: '', cent: '' }
          PDFinformationDetailsObject.coordinates.x = request.query.easting
          PDFinformationDetailsObject.coordinates.y = request.query.northing
          PDFinformationDetailsObject.polygon = request.query.polygon
          PDFinformationDetailsObject.cent = request.query.center
          PDFinformationDetailsObject.location = request.query.location
          PDFinformationDetailsObject.zoneNumber = request.query.zoneNumber
          const model = new ContactViewModel({
            PDFinformationDetailsObject: PDFinformationDetailsObject
          })
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
      description: 'submits the page to Application summary Review Screen',
      auth: {
        strategy: 'restricted'
      },
      handler: async (request, h) => {
        try {
          const payload = request.payload
          var PDFinformationDetailsObject = { coordinates: { x: 0, y: 0 }, location: '', polygon: '', center: '', zoneNumber: '' }

          let model = {}
          const { recipientemail, fullName } = request.payload
          // Sanitise user inputs
          const isNameFormatValid = nameRegex.test(fullName)
          const isEmailFormatValid = emailRegex.test(recipientemail)
          if (recipientemail.trim() !== '' && isEmailFormatValid && fullName.trim() !== '' && isNameFormatValid) {
            if (payload && payload.easting && payload.northing) {
              PDFinformationDetailsObject.coordinates.x = payload.easting
              PDFinformationDetailsObject.coordinates.y = payload.northing
              if (payload.zoneNumber) {
                PDFinformationDetailsObject.zoneNumber = payload.zoneNumber
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
            } else {
              return Boom.badImplementation('Query parameters are empty')
            }

            // Forward details to application summary review page
            const queryParams = {}
            queryParams.fullName = payload.fullName
            queryParams.polygon = payload.polygon
            queryParams.recipientemail = payload.recipientemail
            queryParams.x = PDFinformationDetailsObject.coordinates.x
            queryParams.y = PDFinformationDetailsObject.coordinates.y
            queryParams.location = PDFinformationDetailsObject.location
            queryParams.zoneNumber = PDFinformationDetailsObject.zoneNumber
            queryParams.cent = payload.cent

            // During serializing, the UTF-8 encoding format is used to encode any character that requires percent-encoding.
            const query = QueryString.stringify(queryParams)
            return h.redirect(`/application-review-summary?${query}`)
            } else if (recipientemail && recipientemail.trim() !== '' && isEmailFormatValid) {
            contactViewErrorObject = new ContactViewErrorObject(fullName, recipientemail, payload, [fullNameErrorMessage])
            contactViewErrorObject.fullnameError = fullNameErrorMessage
            model = new ContactViewModel(contactViewErrorObject)
          } else if (fullName && fullName.trim() !== '' && isNameFormatValid) {
            contactViewErrorObject = new ContactViewErrorObject(fullName, recipientemail, payload, [emailErrorMessage])
            contactViewErrorObject.emailError = emailErrorMessage
            model = new ContactViewModel(contactViewErrorObject)
          } else {
            contactViewErrorObject = new ContactViewErrorObject(fullName, recipientemail, payload, [fullNameErrorMessage, emailErrorMessage])
            contactViewErrorObject.fullnameError = fullNameErrorMessage
            contactViewErrorObject.emailError = emailErrorMessage
            model = new ContactViewModel(contactViewErrorObject)
          }
          return h.view('contact', model)
        } catch (error) {
        }
      }
    }
  }]
