const Boom = require('boom')
const QueryString = require('querystring')
const config = require('../../config')
const wreck = require('wreck')
const uuidv1 = require('uuid/v1')
const { getApplicationReferenceNumber } = require('../services/application-reference')
const publishToQueueURL = config.functionAppUrl + '/publish-queue'
const ContactViewModel = require('../models/contact-view')
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const nameRegex = /[a-zA-Z][a-zA-Z ]+[a-zA-Z]$/

class ContactViewErrorObject {
  constructor(fullName, recipientemail, payload, errorSummarArray) {
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
          const recipientemail = request.query.recipientemail
          var PDFinformationDetailsObject = { coordinates: { x: 0, y: 0 }, location: "", zoneNumber: "", polygon: "", cent: "" }
          PDFinformationDetailsObject.coordinates.x = request.query.easting
          PDFinformationDetailsObject.coordinates.y = request.query.northing
          PDFinformationDetailsObject.polygon = request.query.polygon
          PDFinformationDetailsObject.cent = request.query.center
          PDFinformationDetailsObject.location = request.query.location
          PDFinformationDetailsObject.zoneNumber = request.query.zoneNumber
          let model
          if (recipientemail) {
            model = new ContactViewModel(
              {
                fullName: '',
                recipientemail: recipientemail,
                PDFinformationDetailsObject: PDFinformationDetailsObject
              })
          } else {
            model = new ContactViewModel({
              PDFinformationDetailsObject: PDFinformationDetailsObject
            })
          }
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
              PDFinformationDetailsObject.applicationReferenceNumber = applicationReferenceNumber
            } else {
              return Boom.badImplementation('Query parameters are empty')
            }
            // Send details to function app
            const { x, y } = PDFinformationDetailsObject.coordinates
            const { location, polygon } = PDFinformationDetailsObject
            const name = payload.fullName
            const recipientemail = payload.recipientemail
            const data = JSON.stringify({ name, recipientemail, x, y, polygon, location, applicationReferenceNumber })
            await wreck.post(publishToQueueURL, {
              payload: data
            })

            // Forward details to confirmation page
            const queryParams = {}
            queryParams.fullName = payload.fullName
            queryParams.polygon = payload.polygon
            queryParams.recipientemail = payload.recipientemail
            queryParams.applicationReferenceNumber = applicationReferenceNumber
            queryParams.x = PDFinformationDetailsObject.coordinates.x
            queryParams.y = PDFinformationDetailsObject.coordinates.y
            queryParams.location = PDFinformationDetailsObject.location
            queryParams.zoneNumber = PDFinformationDetailsObject.zoneNumber
            queryParams.correlationId = correlationId
            queryParams.cent = PDFinformationDetailsObject.cent

            const query = QueryString.stringify(queryParams)
            return h.redirect(`/confirmation?${query}`)
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
