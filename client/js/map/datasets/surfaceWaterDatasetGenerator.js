import { terms } from '../terms.js'
import { colours } from '../colours.js'

// These are the values for flood zone 2 present day. The other flood zones will override the fz value as appropriate.
const infoPanelData = {
  tf: 'pd',
  ds: 'sw',
  aep: 'low',
  depth: terms.depth.depthOverZero
}
const timeframeToTf = {
  presentday: 'pd',
  climatechange: 'cc'
}

const extentsDatasetSublayerIds = ['extentsFull', 'extentsOver150', 'extentsOver300', 'extentsOver600', 'extentsOver900', 'extentsOver1200', 'extentsOver2300']
const depthDatasetSublayerIds = ['depthOverZero', 'depthOver150', 'depthOver300', 'depthOver600', 'depthOver900', 'depthOver1200', 'depthOver2300']
const layerKeys = ['>2300mm', '1200-2300mm', '900-1200mm', '600-900mm', '300-600mm', '150-300mm', '<150mm']

const subLayerGenerator = (sourceLayer, visibleWhenMenu, aep, timeframe) => {
  let subLayerLastItemIndex = extentsDatasetSublayerIds.length
  const tf = timeframeToTf[timeframe]
  // Generate sublayers for each depth and extents range,
  // with a reducing set of visibleWhen filter values for each extents sublayer,
  const extentsSublayers = []
  const depthSublayers = []

  layerKeys.forEach((layerKey) => {
    const esriStyleLayerId = `${sourceLayer}/${layerKey}/1`
    extentsSublayers.push({
      id: extentsDatasetSublayerIds[subLayerLastItemIndex - 1],
      infoPanelData: { ...infoPanelData, aep, depth: terms.depth[depthDatasetSublayerIds[subLayerLastItemIndex - 1]], tf },
      esriStyleLayerId,
      showInKey: false,
      visibleWhen: { menu: { ...visibleWhenMenu, depth: extentsDatasetSublayerIds.slice(0, subLayerLastItemIndex) } },
    })

    const depthSublayerId = depthDatasetSublayerIds[subLayerLastItemIndex - 1]
    const depthSublayerStyle = {
      outdoor: colours[depthSublayerId].default,
      dark: colours[depthSublayerId].dark
    }
    depthSublayers.push({
      id: depthSublayerId,
      infoPanelData: { ...infoPanelData, aep, depth: terms.depth[depthDatasetSublayerIds[subLayerLastItemIndex - 1]], tf },
      esriStyleLayerId,
      label: terms.depth[depthSublayerId],
      style: {
        stroke: depthSublayerStyle,
        fill: depthSublayerStyle,
      }
    })

    subLayerLastItemIndex--
  })
  return { extentsSublayers, depthSublayers }
}

export const surfaceWaterDatasetGenerator = ({ agolVectorTileUrl, layerNameSuffix, id, tileName, sourceLayer, timeframe, aep }) => {
  const visibleWhenMenu = { dataset: ['surfacewater'], timeframe, aep }
  const { extentsSublayers, depthSublayers } = subLayerGenerator(sourceLayer, visibleWhenMenu, aep[0], timeframe[0])

  const extentsDataset = {
    id: `${id}-extents`,
    label: terms.labels.surfaceWater,
    groupLabel: terms.labels.surfaceWater,
    tiles: `${agolVectorTileUrl}/${tileName}${layerNameSuffix}/VectorTileServer`,
    showInKey: true,
    sourceLayer,
    style: { fill: { outdoor: colours.nonFloodZoneLight, dark: colours.nonFloodZoneDark }, },
    visibleWhen: { menu: visibleWhenMenu },
    sublayers: extentsSublayers
  }

  const depthDataset = {
    id: `${id}-depths`,
    label: terms.labels.surfaceWaterDepthInMillimetres,
    groupLabel: terms.labels.surfaceWater,
    tiles: `${agolVectorTileUrl}/${tileName}${layerNameSuffix}/VectorTileServer`,
    showInKey: false,
    sourceLayer,
    visibleWhen: { menu: { ...visibleWhenMenu, depth: ['depthAll'] } },
    sublayers: depthSublayers
  }

  // We only really need one of these with visibleWhen: { menu: {dataset: ['surfacewater'], depth: ['depthAll'] } },
  const depthsKey = {
    id: `${id}-depths-key`,
    label: 'Surface water',
    groupLabel: terms.labels.surfaceWaterDepthInMillimetres,
    groupStyle: 'ramp',
    showInKey: true,
    visibleWhen: { menu: { ...visibleWhenMenu, depth: ['depthAll'] } },
    sublayers: depthDataset.sublayers.map((sublayer) => {
      return {
        ...sublayer,
        esriStyleLayerId: null,
        label: sublayer.label.match(/[0-9]+/)[0],
      }
    })
  }
  return [extentsDataset, depthDataset, depthsKey]
}
