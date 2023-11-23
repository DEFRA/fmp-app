
module.exports = [{
  method: 'GET',
  path: '/',
  options: {
    description: 'Home Page',
    handler: async (request, h) => {
      if (typeof request.yar === 'undefined' || typeof request.yar.get('displayError') === 'undefined') {
        // return h.view('home', { allowRobots: true, headers: JSON.stringify(request.headers) })
        // const fmpSession = request.state.FMP_SESSION || { serverSession: true, random: Math.random() }
        const fmpSession = request.state.FMP_SESSION || `${Math.random()}`
        // const { AWSALB, AWSALBAPP, AWSALBTG } = request.state
        const headers = JSON.stringify(request.headers)
        // console.log('\nhome\ Request.headers', request.headers)
        // console.log('\nhome\ Request.headers Stringified', headers)
        const serverCookies = JSON.stringify(request.state)
        return h.view('home', {
          allowRobots: true,
          headers: encodeURIComponent(headers),
          fmpSession: encodeURIComponent(fmpSession),
          serverCookies: encodeURIComponent(serverCookies)
        }).state('FMP_SESSION', fmpSession)
      } else {
        const errMess = request.yar.get('displayError')
        request.yar.set('displayError', {})
        return h.view('home', errMess)
      }
    }
  }
}, {
  method: 'POST',
  path: '/',
  options: {
    description: 'Home Page Post'
  },
  handler: async (request, h) => {
    return h.redirect('/location')
  }
}]
