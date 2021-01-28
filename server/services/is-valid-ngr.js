const twelveCharactersRegex = /^(?:HP|HT|HU|H[W-Z]|N[A-D]|NF|N[G-H]|N[J-O]|N[R-U]|N[W-Z]|OV|S[C-E]|SH|S[J-K]|S[M-P]|S[R-Z]|TA|T[F-G]|T[L-M]|T[Q-R]|TV)\d{10}$/
const tenCharactersRegex = /^(?:HP|HT|HU|H[W-Z]|N[A-D]|NF|N[G-H]|N[J-O]|N[R-U]|N[W-Z]|OV|S[C-E]|SH|S[J-K]|S[M-P]|S[R-Z]|TA|T[F-G]|T[L-M]|T[Q-R]|TV)\d{8}$/
module.exports = {
  get: async (ngr) => {
    var response = { isValid: false }
    var formattedNgr = ngr.replace(/\s+/g, '')
    switch (formattedNgr.length) {
      case 12:
        if (twelveCharactersRegex.test(formattedNgr.toUpperCase())) {
          response.isValid = true
        }
        break
      case 10:
        if (tenCharactersRegex.test(formattedNgr.toUpperCase())) {
          response.isValid = true
        }
        break
      default:
        return response
    }
    return response
  }
}
