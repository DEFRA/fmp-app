module.exports = [
  {
    method: 'GET',
    path: '/triage',
    options: {
      description: 'Triage Page',
      handler: async (request, h) => {
        return h.view('triage')
      }
    }
  }
]
