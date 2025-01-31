const { getEsriToken } = require('../../services/agol/getEsriToken')
const { getOsToken } = require('../../services/os/getOsToken')

module.exports = [
  {
    method: 'GET',
    path: '/map',
    options: {
      description: 'a POC page to display the map component',
      handler: async (request, h) => {
        return h.view('map')
      }
    }
  }, {
    method: 'GET',
    path: '/os-token',
    options: {
      description: 'Get a short lived token for the OS base maps',
      handler: async (request, h) => {
        return await getOsToken()
      }
    }
  },
  {
    method: 'GET',
    path: '/esri-token',
    options: {
      description: 'Get a short lived token for the ESRI map data and layers',
      handler: async (request, h) => {
        return await getEsriToken()
      }
    }
  }
]
