const Boom = require('boom')
const ContactAndPDFInformationObjectViewModel = require('../models/contact-and-pdf-information-view')
const QueryString = require('querystring')
const config = require('../../config')
const util = require('../util')
const wreck = require('wreck')
const uuidv1 = require('uuid/v1')
module.exports = [
  {
    method: 'GET',
    path: '/contact',
    options: {
      description: 'Get contact details page for product 4',
      handler: async (request, h) => {
        try {
          const email = request.query.email
          var PDFinformationDetailsObject = { coordinates: { x: 0, y: 0 } }
          PDFinformationDetailsObject.coordinates.x = request.query.eastings
          PDFinformationDetailsObject.coordinates.y = request.query.northing
          if (email) {
            return h.view('contact', new ContactAndPDFInformationObjectViewModel(
              {
                fullName: '',
                email: email,
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
      handler: async (request, h) => {
        var correlationId = uuidv1()
        try {
          const payload = request.payload
          var PDFinformationDetailsObject = { coordinates: { x: 0, y: 0 } }
          if (request.payload && request.payload.eastings && request.payload.northing) {
            PDFinformationDetailsObject.coordinates.x = request.payload.eastings
            PDFinformationDetailsObject.coordinates.y = request.payload.northing
          } else {
            return Boom.badImplementation('Query parameters are not empty')
          }
          let queryParams = {}
          queryParams.email = payload.email
          queryParams.x = PDFinformationDetailsObject.coordinates.x
          queryParams.y = PDFinformationDetailsObject.coordinates.y
          queryParams.correlationId = correlationId
          const query = QueryString.stringify(queryParams)

          const { x, y } = PDFinformationDetailsObject.coordinates
          const data = JSON.stringify({ x, y })

          await util.LogMessage(`Calling the  HttpTrigger with x and y co-ordinates ${x}, ${y}`, '', correlationId)

          //  await wreck.post(config.httpSendTrigger, {
          //    payload: data
          //})

          await util.LogMessage(`Called the HttpTrigger Function `, '', correlationId)
          return h.redirect(`/confirmation?${query}`)
        } catch (err) {
          await util.LogMessage(`${err.message}`, '', correlationId)
          return Boom.badImplementation(err.message, err)
        }
      }
    }
  }]
