const { config } = require('../../config')
const wreck = require('@hapi/wreck')
const publishToQueueURL = config.functionAppUrl + '/order-product-four'
const { getAreaInHectares, getCentreOfPolygon } = require('../services/shape-utils')
const addressService = require('../services/address')
const constants = require('../constants')
const { validateContactData } = require('./validateContactData')

const getFunctionAppResponse = async (data) => {
  const payload = JSON.parse(data)
  const postcode = await addressService.getPostcodeFromEastingorNorthing(
    payload?.x,
    payload?.y
  )
  payload.postcode = postcode

  return wreck.post(publishToQueueURL, { json: true, payload: JSON.stringify(payload) })
}

module.exports = [
  {
    method: 'GET',
    path: '/check-your-details',
    options: {
      description: 'Application Review Summary',
      handler: async (request, h) => {
        const { polygon, fullName = '', recipientemail = '' } = request.query
        const { errorSummary } = validateContactData({ fullName, recipientemail })
        if (errorSummary.length > 0) {
          return h.view(constants.views.CONTACT, {
            errorSummary,
            polygon,
            fullName,
            recipientemail
          })
        }

        const { floodZone } = await request.server.methods.getFloodZoneByPolygon(polygon)
        const contactUrl = `/contact?polygon=${polygon}`
        const mapUrl = `/map?polygon=${polygon}`
        return h.view('check-your-details', { polygon, fullName, recipientemail, contactUrl, mapUrl, floodZone })
      }
    }
  },
  {
    method: 'POST',
    path: '/check-your-details',
    options: {
      description: 'submits the page to Confirmation Screen',
      handler: async (request, h) => {
        const { recipientemail, fullName, polygon } = request.payload
        const coordinates = getCentreOfPolygon(polygon)
        const { floodZone: zoneNumber } = await request.server.methods.getFloodZoneByPolygon(polygon)
        let applicationReferenceNumber

        // Check if p4Request is duplicate
        if (!request.state?.p4Request?.[polygon]) {
          // Send details to function app
          const plotSize = getAreaInHectares(polygon)
          const psoResults = await request.server.methods.getPsoContactsByPolygon(polygon)
          const data = JSON.stringify({
            appType: config.appType,
            name: fullName,
            customerEmail: recipientemail,
            x: coordinates.x,
            y: coordinates.y,
            polygon: `[${polygon}]`,
            zoneNumber,
            plotSize,
            areaName: psoResults.AreaName,
            psoEmailAddress: psoResults.EmailAddress,
            llfa: psoResults.LocalAuthorities || ''
          })
          try {
            const result = await getFunctionAppResponse(data)
            applicationReferenceNumber = result.payload.applicationReferenceNumber
            // Upsert p4Cookie to store app ref by polygon key
            const p4Cookie = request.state.p4Request || {}
            p4Cookie[polygon] = applicationReferenceNumber
            h.state('p4Request', p4Cookie)
          } catch (error) {
            console.log(
              '\nFailed to POST these data to the functionsApp /order-product-four:\n',
              data
            )
            console.log('Error\n', JSON.stringify(error))
            const redirectURL = `/order-not-submitted?polygon=${polygon}`
            return h.redirect(redirectURL)
          }
        } else {
          applicationReferenceNumber = request.state.p4Request[polygon]
        }

        // Forward details to confirmation page
        const queryParams = {
          applicationReferenceNumber,
          polygon,
          recipientemail,
          zoneNumber
        }
        // During serializing, the UTF-8 encoding format is used to encode any character that requires percent-encoding.
        const query = new URLSearchParams(queryParams).toString()
        return h.redirect(`/confirmation?${query}`)
      }
    }
  }
]
