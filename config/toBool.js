const toBool = (val) => {
  if (val === true || val === 'true') {
    return true
  }
  if (val === false || val === 'false') {
    return false
  }
  return undefined
}
module.exports = { toBool }
