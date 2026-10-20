const { getHostAndProtocol } = require('../services/getHostAndProtocol')

module.exports = [
  {
    method: 'GET',
    path: '/',
    options: {
      description: 'Home Page',
      handler: async (request, h) => {
        try {
          // The call to getHostAndProtocol is here just to check whether we
          // get any errors  in the logs which may require fixing prior to
          // v3.9 with the proxy.
          // If we see any "Unable to resolve host and protocol", we will
          // need to address it before release the proxy.
          getHostAndProtocol(request)
        } catch (error) {
          console.error('Error getting host and protocol:', error)
        }
        return h.view('home', { allowRobots: true })
      }
    }
  }
]
