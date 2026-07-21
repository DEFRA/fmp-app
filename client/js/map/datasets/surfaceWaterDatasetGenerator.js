import { terms } from '../terms.js'
import { colours } from '../colours.js'

export const surfaceWaterDatasetGenerator = ({ agolVectorTileUrl, layerNameSuffix, id, tileName, sourceLayer, timeframe, aep }) => {
  const visibleWhenMenu = { dataset: ['surfacewater'], timeframe, aep }

  const extentsDataset = {
    id: `${id}-extents`,
    label: terms.labels.surfaceWater,
    groupLabel: terms.labels.datasets,
    tiles: `${agolVectorTileUrl}/${tileName}${layerNameSuffix}/VectorTileServer`,
    showInKey: true,
    sourceLayer,
    style: { fill: { outdoor: colours.nonFloodZoneLight, dark: colours.nonFloodZoneDark }, },
    visibleWhen: { menu: visibleWhenMenu },
    sublayers: [
      {
        id: 'depthOver2300',
        esriStyleLayerId: `${sourceLayer}/>2300mm/1`,
        showInKey: false,
        visibleWhen: { menu: { ...visibleWhenMenu, depth: ['depth150', 'depth300', 'depth600', 'depth900', 'depth1200', 'depth2300', 'depthOver2300'] } },
      },
      {
        id: 'depth2300',
        esriStyleLayerId: `${sourceLayer}/1200-2300mm/1`,
        showInKey: false,
        visibleWhen: { menu: { ...visibleWhenMenu, depth: ['depth150', 'depth300', 'depth600', 'depth900', 'depth1200', 'depth2300'] } },
      },
      {
        id: 'depth1200',
        esriStyleLayerId: `${sourceLayer}/900-1200mm/1`,
        showInKey: false,
        visibleWhen: { menu: { ...visibleWhenMenu, depth: ['depth150', 'depth300', 'depth600', 'depth900', 'depth1200'] } },
      },
      {
        id: 'depth900',
        esriStyleLayerId: `${sourceLayer}/600-900mm/1`,
        showInKey: false,
        visibleWhen: { menu: { ...visibleWhenMenu, depth: ['depth150', 'depth300', 'depth600', 'depth900'] } },
      },
      {
        id: 'depth600',
        esriStyleLayerId: `${sourceLayer}/300-600mm/1`,
        showInKey: false,
        visibleWhen: { menu: { ...visibleWhenMenu, depth: ['depth150', 'depth300', 'depth600'] } },
      },
      {
        id: 'depth300',
        esriStyleLayerId: `${sourceLayer}/150-300mm/1`,
        showInKey: false,
        visibleWhen: { menu: { ...visibleWhenMenu, depth: ['depth150', 'depth300'] } },
      },
      {
        id: 'depth150',
        esriStyleLayerId: `${sourceLayer}/<150mm/1`,
        showInKey: false,
        visibleWhen: { menu: { ...visibleWhenMenu, depth: ['depth150'] } },
      },
    ]
  }

  const depthDataset = {
    id: `${id}-depths`,
    label: terms.labels.surfaceWaterDepthInMillimetres,
    groupLabel: terms.labels.datasets,
    tiles: `${agolVectorTileUrl}/${tileName}${layerNameSuffix}/VectorTileServer`,
    showInKey: true,
    sourceLayer,
    visibleWhen: { menu: { ...visibleWhenMenu, depth: ['depthAll'] } },
    sublayers: [
      {
        id: 'depthOver2300',
        esriStyleLayerId: `${sourceLayer}/>2300mm/1`,
        label: terms.depth.key.depthOver2300,
        style: {
          fill: { outdoor: colours.depthOver2300.default, dark: colours.depthOver2300.dark },
        }
      },
      {
        id: 'depth2300',
        esriStyleLayerId: `${sourceLayer}/1200-2300mm/1`,
        label: terms.depth.key.depth2300,
        style: {
          fill: { outdoor: colours.depth2300.default, dark: colours.depth2300.dark },
        }
      },
      {
        id: 'depth1200',
        esriStyleLayerId: `${sourceLayer}/900-1200mm/1`,
        label: terms.depth.key.depth1200,
        style: {
          fill: { outdoor: colours.depth1200.default, dark: colours.depth1200.dark },
        }
      },
      {
        id: 'depth900',
        esriStyleLayerId: `${sourceLayer}/600-900mm/1`,
        label: terms.depth.key.depth900,
        style: {
          fill: { outdoor: colours.depth900.default, dark: colours.depth900.dark },
        }
      },
      {
        id: 'depth600',
        esriStyleLayerId: `${sourceLayer}/300-600mm/1`,
        label: terms.depth.key.depth600,
        style: {
          fill: { outdoor: colours.depth600.default, dark: colours.depth600.dark },
        }
      },
      {
        id: 'depth300',
        esriStyleLayerId: `${sourceLayer}/150-300mm/1`,
        label: terms.depth.key.depth300,
        style: {
          fill: { outdoor: colours.depth300.default, dark: colours.depth300.dark },
        }
      },
      {
        id: 'depth150',
        esriStyleLayerId: `${sourceLayer}/<150mm/1`,
        label: terms.depth.key.depth150,
        style: {
          fill: { outdoor: colours.depth150.default, dark: colours.depth150.dark },
        }
      },
    ]
  }
  return [extentsDataset, depthDataset]
}
