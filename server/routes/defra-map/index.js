const { getEsriToken } = require('../../services/agol/getEsriToken')
const { getOsToken } = require('../../services/os/getOsToken')

module.exports = [
  {
    method: 'POST',
    path: '/gotenburg',
    options: {
      description: 'gotenburg server proxy',
      handler:  {
        proxy: {
          // TODO: add this path to the config
          uri: 'http://localhost:3000/forms/chromium/convert/html',
          passThrough: true
        },
      }
    }
  }, {
    method: 'GET',
    path: '/map',
    options: {
      description: 'display the map component page',
      handler: async (_request, h) => {
        return h.view('map')
      }
    }
  }, {
    method: 'GET',
    path: '/os-token',
    options: {
      description: 'Get a short lived token for the OS base maps',
      handler: async (_request, _h) => {
        return getOsToken()
      }
    }
  },
  {
    method: 'GET',
    path: '/esri-token',
    options: {
      description: 'Get a short lived token for the ESRI map data and layers',
      handler: async (request, _h) => {
        const { refresh = false } = request.query
        return getEsriToken(refresh)
      }
    }
  }
]
