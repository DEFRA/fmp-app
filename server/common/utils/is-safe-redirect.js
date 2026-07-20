function isSafeRedirect (url) {
  if (!url || typeof url !== 'string') {
    return false
  }
  return url.startsWith('/') && !url.startsWith('//')
}

module.exports = { isSafeRedirect }
