const osAuth = {}
const esriAuth = {}
export const getOsToken = async () => {
  // Check token is valid
  const isExpired = !Object.keys(osAuth).length || Date.now() >= osAuth?.expiresAt

  if (isExpired) {
    try {
      const response = await window.fetch('/os-token', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      const json = await response.json()
      osAuth.token = json.access_token
      osAuth.expiresAt = Date.now() + ((json.expires_in - 30) * 1000)
    } catch (err) {
      console.log('Error getting OS access token: ', err)
    }
  }

  return osAuth
}

export const getEsriToken = async (refresh = false) => {
  const hasToken = esriAuth.token

  if (refresh || !hasToken) {
    try {
      const queryString = refresh ? '?refresh=true' : ''
      const response = await window.fetch(`/esri-token${queryString}`)
      const json = await response.json()
      Object.assign(esriAuth, json)
    } catch (err) {
      console.log('Error getting ESRI access token: ', err)
    }
  }

  return esriAuth.token
}
