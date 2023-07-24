const Code = require('@hapi/code')

module.exports = {
  payloadMatchTest: async (payload, regex, expectedMatchCount = 1) => {
    const errorMatch = payload.match(regex) || []
    Code.expect(errorMatch.length, `\nFailed Regex match: ${regex}\n`).to.equal(expectedMatchCount)
  },
  titleTest: async (payload, expectedTitle) => {
    const titleMatch = payload.match(/<title>([\s\S]*)<\/title>/)
    Code.expect(titleMatch.length, 'a title match is expected').to.equal(2)
    Code.expect(titleMatch[1].trim()).to.equal(expectedTitle)
  }
}
