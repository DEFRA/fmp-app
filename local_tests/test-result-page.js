const axios = require('axios')
const { performance } = require('node:perf_hooks')

const polygon = [
  [510214.3, 168078.28],
  [510679.61, 168088.31],
  [511123.9, 167962.67],
  [511221.36, 167718.07],
  [510915.61, 167744.82],
  [510698.24, 167633.04],
  [510504.2, 167731.82],
  [510417.33, 167501.42],
  [510134.04, 167481.59],
  [510028.94, 167920.39],
  [510214.3, 168078.28]
]
const getRandomPolygon = (polygon) => {
  const rand = Math.round(1000 * (2 * Math.random() - 1)) / 1000

  return polygon.map(([x, y]) => {
    return [x + rand, y + rand]
  })
}

const makeMultiRequests = async (count) => {
  let totalTime = 0
  for (let i = 0; i < count; i++) {
    const url = `https://fmp2-dev.aws-int.defra.cloud/results?polygon=${JSON.stringify(getRandomPolygon(polygon))}`

    const startTime = performance.now()
    await axios.get(url)
    const endTime = performance.now()
    const time = endTime - startTime
    totalTime += time
    console.log('Request time = ', time / 1000)
  }
  console.log('Request total time = ', totalTime / 1000)
}

makeMultiRequests(10)
