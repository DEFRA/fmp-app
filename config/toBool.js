const toBool = (val) => (val === true || val === 'true')
  ? true
  : (val === false || val === 'false')
      ? false
      : undefined
module.exports = { toBool }
