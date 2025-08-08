const { performance } = require('node:perf_hooks')

class PerformanceLogger {
  constructor (processName) {
    this.processName = processName
    this.startTime = performance.now()
  }

  logTime () {
    console.log(`${this.processName} time in seconds: `, Math.round(1000 * (performance.now() - this.startTime) / 1000) / 1000)
  }
}

module.exports = { PerformanceLogger }
