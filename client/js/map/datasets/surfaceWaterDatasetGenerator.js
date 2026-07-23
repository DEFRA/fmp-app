import { terms } from '../terms.js'
import { colours } from '../colours.js'

const extentsDatasetSublayerIds = ['extentsFull', 'extentsOver150', 'extentsOver300', 'extentsOver600', 'extentsOver900', 'extentsOver1200', 'extentsOver2300']
const depthDatasetSublayerIds = ['depthOverZero', 'depthOver150', 'depthOver300', 'depthOver600', 'depthOver900', 'depthOver1200', 'depthOver2300']
const layerKeys = ['>2300mm', '1200-2300mm', '900-1200mm', '600-900mm', '300-600mm', '150-300mm', '<150mm']

const subLayerGenerator = (sourceLayer, visibleWhenMenu) => {
  let subLayerLastItemIndex = extentsDatasetSublayerIds.length
  // Generate sublayers for each depth and extents range,
  // with a reducing set of visibleWhen filter values for each extents sublayer,
  const extentsSublayers = []
  const depthSublayers = []

  layerKeys.forEach((layerKey) => {
    const esriStyleLayerId = `${sourceLayer}/${layerKey}/1`
    extentsSublayers.push({
      id: extentsDatasetSublayerIds[subLayerLastItemIndex - 1],
      esriStyleLayerId,
      showInKey: false,
      visibleWhen: { menu: { ...visibleWhenMenu, depth: extentsDatasetSublayerIds.slice(0, subLayerLastItemIndex) } },
    })

    const depthSublayerId = depthDatasetSublayerIds[subLayerLastItemIndex - 1]
    depthSublayers.push({
      id: depthSublayerId,
      esriStyleLayerId,
      label: terms.depth[depthSublayerId],
      style: {
        fill: {
          outdoor: colours[depthSublayerId].default,
          dark: colours[depthSublayerId].dark
        },
      }
    })

    subLayerLastItemIndex--
  })
  return { extentsSublayers, depthSublayers }
}

export const surfaceWaterDatasetGenerator = ({ agolVectorTileUrl, layerNameSuffix, id, tileName, sourceLayer, timeframe, aep }) => {
  const visibleWhenMenu = { dataset: ['surfacewater'], timeframe, aep }
  const { extentsSublayers, depthSublayers } = subLayerGenerator(sourceLayer, visibleWhenMenu)

  const extentsDataset = {
    id: `${id}-extents`,
    label: terms.labels.surfaceWater,
    groupLabel: terms.labels.datasets,
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
    groupLabel: terms.labels.datasets,
    tiles: `${agolVectorTileUrl}/${tileName}${layerNameSuffix}/VectorTileServer`,
    showInKey: true,
    sourceLayer,
    visibleWhen: { menu: { ...visibleWhenMenu, depth: ['depthAll'] } },
    sublayers: depthSublayers
  }
  return [extentsDataset, depthDataset]
}
