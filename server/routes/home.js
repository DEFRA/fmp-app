module.exports = [
  {
    method: 'GET',
    path: '/',
    options: {
      description: 'Home Page',
      handler: async (_request, h) => h.view('home', { allowRobots: true })
    }
  }
]
