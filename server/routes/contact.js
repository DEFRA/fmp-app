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
        var PDFinformationDetailsObject = { coordinates: { x: 0, y: 0 }, location: '' }
        PDFinformationDetailsObject.coordinates.x = request.query.easting
        PDFinformationDetailsObject.coordinates.y = request.query.northing
        PDFinformationDetailsObject.location = encodeURIComponent(request.query.location)
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
        var PDFinformationDetailsObject = { coordinates: { x: 0, y: 0 }, applicationReferenceNumber: '' }

        let model = {}
        const { recipientemail, fullName } = request.payload
        const isEmailFormatValid = emailRegex.test(recipientemail)
        const isNameFormatValid = nameRegex.test(fullName)
        if (recipientemail.trim() !== '' && isEmailFormatValid && fullName.trim() !== '' && isNameFormatValid) {
          if (payload && payload.easting && payload.northing) {
            PDFinformationDetailsObject.coordinates.x = payload.easting
            PDFinformationDetailsObject.coordinates.y = payload.northing
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
        } else if (recipientemail && recipientemail.trim() !== '' && isEmailFormatValid) {
          const errors = [{ text: 'Please enter valid Full name', href: '#fullName' }]
          model = {}
          model = new ContactViewModel({
            errorSummary: errors,
            fullName: fullName,
            recipientemail: recipientemail,
            fullnameError: { text: 'Please enter valid Full name' }
          })
        } else if (fullName && fullName.trim() !== '' && isNameFormatValid) {
          const errors = [{ text: 'Please enter valid email', href: '#recipientemail' }]
          model = {}
          model = new ContactViewModel({
            errorSummary: errors,
            fullName: fullName,
            recipientemail: recipientemail,
            emailError: { text: 'Please enter valid email' }
          })
        } else {
          const errors = [{ text: 'Please enter valid Full name', href: '#fullName' },
            { text: 'Please enter valid email', href: '#recipientemail' }
          ]
          model = {}
          model = new ContactViewModel({
            errorSummary: errors,
            fullName: fullName,
            recipientemail: recipientemail,
            emailError: { text: 'Please enter valid email' },
            fullnameError: { text: 'Please enter valid Full name' }
          })
        }
        return h.view('contact', model)
      } catch (error) {

      }
    }
  }
}]
