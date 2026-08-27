const isEnabled = () => process.env.PROXY_DEBUG === 'true'

const logDebug = (message, metadata = {}) => {
  if (!isEnabled()) {
    return
  }

  const payload = Object.keys(metadata).length ? ` ${JSON.stringify(metadata)}` : ''
  console.log(`[proxy-debug] ${message}${payload}`)
}

module.exports = {
  isEnabled,
  logDebug
}
