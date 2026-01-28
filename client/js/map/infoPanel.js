/*
  tf: Timeframe - [pd:Present day, cc:Climate change]
  ds: dataset - [fz,sw,rs],
  fz: Flood zone - [2,3,nd,cc or none]
  fs:, Flood source - [River,Sea, River and sea or none],
  aep: [low,medium,high or none]
*/
const infoPanelURL = '/defra-map/info-panel'

const getInfoPanel = async (infoPanelValues, coord, depth = '') => {
  const queryString = new URLSearchParams()
  queryString.set('ds', infoPanelValues.ds)
  queryString.set('tf', infoPanelValues.tf)
  if (infoPanelValues.fz) { queryString.set('fz', infoPanelValues.fz) }
  if (infoPanelValues.fs) { queryString.set('fs', infoPanelValues.fs) }
  if (infoPanelValues.aep) { queryString.set('aep', infoPanelValues.aep) }
  if (infoPanelValues.depth) { queryString.set('depth', infoPanelValues.depth) }

  const url = `${infoPanelURL}?${queryString.toString()}`
  const response = await window.fetch(url, { method: 'GET' })
  if (response.ok) {
    return response.text().then((html) => {
      return html
        .replace('COORDS', `${Math.round(coord[0])},${Math.round(coord[1])}`)
        .replace('DEPTH', depth)
    })
  }

  return null
}

export { getInfoPanel }
