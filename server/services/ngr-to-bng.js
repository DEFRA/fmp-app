const ngrToBng = require('ngr-to-bng')

module.exports = {
  convert: (ngr) => {
    return ngrToBng(ngr)
  }
}
