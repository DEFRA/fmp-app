module.exports = [{
  method: 'GET',
  path: '/cookies',
  options: {
    description: 'Cookies Page',
    handler: async (request, h) => {
      return h.view('cookies')
    }
  }
},
{
  method: 'POST',
  path: '/cookies',
  options: {
    description: 'Cookies'
  },
  handler: async (request, h) => {
    return h.redirect('/cookies')
  }
}]
