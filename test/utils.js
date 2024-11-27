const Code = require('@hapi/code')
const { JSDOM } = require('jsdom')

const assertSelectorContainsText = async (response, selector, content) => {
  const { payload } = response
  const {
    window: { document: doc }
  } = await new JSDOM(payload)
  const div = doc.querySelectorAll(selector)
  Code.expect(div.length).to.equal(content ? 1 : 0) // check for a single result if content is passed, otherwise expect nothing
  if (content) {
    Code.expect(div[0].textContent).to.contain(content)
  }
}

module.exports = {
  payloadMatchTest: async (payload, regex, expectedMatchCount = 1) => {
    const errorMatch = payload.match(regex) || []
    Code.expect(errorMatch.length, `\nFailed Regex match: ${regex}\n`).to.equal(
      expectedMatchCount
    )
  },
  titleTest: async (payload, expectedTitle) => {
    assertSelectorContainsText({ payload }, 'head title', expectedTitle)
  },
  assertSelectorContainsText

}
