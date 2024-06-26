const Boom = require('@hapi/boom')
const ContactViewModel = require('../models/contact-view')
const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const nameRegex = /[a-zA-Z][a-zA-Z ]+[a-zA-Z]$/

class ContactViewErrorObject {
  constructor (fullName, recipientemail, payload, errorSummarArray) {
    this.fullName = fullName
    this.PDFinformationDetailsObject = {
      polygon: payload.polygon,
      cent: payload.cent,
      recipientemail: payload.recipientemail,
      fullName: payload.fullName,
      coordinates: {
        x: payload.easting,
        y: payload.northing
      },
      location: payload.location,
      zoneNumber: payload.zoneNumber
    }
    this.recipientemail = recipientemail
    this.errorSummary = errorSummarArray
  }
}
const emailErrorMessage = {
  text: 'Enter an email address in the correct format, like name@example.com',
  href: '#recipientemail'
}
const fullNameErrorMessage = { text: 'Enter your full name', href: '#fullName' }

module.exports = [
  {
    method: 'GET',
    path: '/contact',
    options: {
      description: 'Get contact details page for product 4',
      handler: async (request, h) => {
        try {
          const PDFinformationDetailsObject = {
            coordinates: { x: 0, y: 0 },
            location: '',
            zoneNumber: '',
            polygon: '',
            cent: ''
          }
          PDFinformationDetailsObject.coordinates.x = request.query.easting
          PDFinformationDetailsObject.coordinates.y = request.query.northing
          PDFinformationDetailsObject.polygon = request.query.polygon
          PDFinformationDetailsObject.cent = request.query.center
          PDFinformationDetailsObject.location = request.query.location
          PDFinformationDetailsObject.zoneNumber = request.query.zoneNumber
          const model = new ContactViewModel({
            PDFinformationDetailsObject
          })
          return h.view('contact', model)
        } catch (err) {
          // I can't think of a way to cause an error in this try catch block so this catch may be unrequired and is not covered by tests
          return Boom.badImplementation(err.message, err)
        }
      },
      validate: {}
    }
  },
  {
    method: 'POST',
    path: '/contact',
    options: {
      description: 'submits the page to Application summary Review Screen',
      handler: async (request, h) => {
        try {
          const payload = request.payload
          const PDFinformationDetailsObject = {
            coordinates: { x: 0, y: 0 },
            location: '',
            polygon: '',
            center: '',
            zoneNumber: ''
          }

          let model = {}
          const { recipientemail, fullName } = request.payload
          // Sanitise user inputs
          const isNameFormatValid = nameRegex.test(fullName.trim())
          const isEmailFormatValid = emailRegex.test(recipientemail.trim())
          if (recipientemail.trim() !== '' && isEmailFormatValid && fullName.trim() !== '' && isNameFormatValid) {
            if (payload.easting && payload.northing) {
              PDFinformationDetailsObject.coordinates.x = payload.easting
              PDFinformationDetailsObject.coordinates.y = payload.northing
              PDFinformationDetailsObject.recipientemail = recipientemail.trim()
              PDFinformationDetailsObject.fullName = fullName.trim()
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

            const params =
              `easting=${queryParams.x}&northing=${queryParams.y}&polygon=${queryParams.polygon}` +
              `&center=${queryParams.cent}&location=${queryParams.location}&zoneNumber=${queryParams.zoneNumber}` +
              `&fullName=${fullName}&recipientemail=${recipientemail}`

            return h.redirect(`/check-your-details?${params}`)
          } else if (recipientemail && recipientemail.trim() !== '' && isEmailFormatValid) {
            const contactViewErrorObject = new ContactViewErrorObject(fullName, recipientemail, payload, [
              fullNameErrorMessage
            ])
            contactViewErrorObject.fullnameError = fullNameErrorMessage
            model = new ContactViewModel(contactViewErrorObject)
          } else if (fullName && fullName.trim() !== '' && isNameFormatValid) {
            const contactViewErrorObject = new ContactViewErrorObject(fullName, recipientemail, payload, [
              emailErrorMessage
            ])
            contactViewErrorObject.emailError = emailErrorMessage
            model = new ContactViewModel(contactViewErrorObject)
          } else {
            const contactViewErrorObject = new ContactViewErrorObject(fullName, recipientemail, payload, [
              fullNameErrorMessage,
              emailErrorMessage
            ])
            contactViewErrorObject.fullnameError = fullNameErrorMessage
            contactViewErrorObject.emailError = emailErrorMessage
            model = new ContactViewModel(contactViewErrorObject)
          }
          return h.view('contact', model)
        } catch (error) {}
      }
    }
  }
]
