const Code = require('code')

module.exports = {
  payloadMatchTest: async (payload, regex, expectedMatchCount = 1) => {
    const errorMatch = payload.match(regex) || []
    Code.expect(errorMatch.length, `\nFailed Regex match: ${regex}\n`).to.equal(expectedMatchCount)
  }
}
