const results = require('./results.json')

const timings = results.testResults.reduce((timings, { name, startTime, endTime }) => {
  const testName = name.split('/').pop()
  timings[testName] = endTime - startTime
  return timings
}, {})

console.log(timings)
