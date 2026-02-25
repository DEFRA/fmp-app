const { getEsriToken } = require('../../services/agol/getEsriToken')
const { getOsToken } = require('../../services/os/getOsToken')

module.exports = [
  {
    method: 'POST',
    path: '/gotenburg',
    options: {
      description: 'arcgis js proxy',
      handler:  {
        proxy: {
          uri: 'http://localhost:3000/forms/chromium/convert/html',
          passThrough: true
        },
      }
    }
  }, {
    method: 'GET',
    path: '/tiles-proxy/{params?}',
    options: {
      description: 'arcgis tiles proxy',
      handler:  {
        proxy: {
          mapUri: function (request) {
            const { url: { href }  } = request
            // The proxy requests that come from the esri sdk are mangled
            // it doesn't format the query string well, so using hapi's
            // request.query doesn't work
            // So we split the requesting href on all instances of ? and &
            // then rejoin them to form a well formed uri
            const [thisUrl, esriUrl, ...queryParams] = href.split(/[?&]/)
            const uri = esriUrl + '?' + queryParams.join('&')
            // console.log('\nuri:', uri)
            return { uri }
          },
          passThrough: true
        },
      }
    }
  }, {
    method: 'GET',
    path: '/map',
    options: {
      description: 'a POC page to display the map component',
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
