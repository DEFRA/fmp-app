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
        id: 'extentsOver2300',
        esriStyleLayerId: `${sourceLayer}/>2300mm/1`,
        showInKey: false,
        visibleWhen: { menu: { ...visibleWhenMenu, depth: ['extentsFull', 'extentsOver150', 'extentsOver300', 'extentsOver600', 'extentsOver900', 'extentsOver1200', 'extentsOver2300'] } },
      },
      {
        id: 'extentsOver1200',
        esriStyleLayerId: `${sourceLayer}/1200-2300mm/1`,
        showInKey: false,
        visibleWhen: { menu: { ...visibleWhenMenu, depth: ['extentsFull', 'extentsOver150', 'extentsOver300', 'extentsOver600', 'extentsOver900', 'extentsOver1200'] } },
      },
      {
        id: 'extentsOver900',
        esriStyleLayerId: `${sourceLayer}/900-1200mm/1`,
        showInKey: false,
        visibleWhen: { menu: { ...visibleWhenMenu, depth: ['extentsFull', 'extentsOver150', 'extentsOver300', 'extentsOver600', 'extentsOver900'] } },
      },
      {
        id: 'extentsOver600',
        esriStyleLayerId: `${sourceLayer}/600-900mm/1`,
        showInKey: false,
        visibleWhen: { menu: { ...visibleWhenMenu, depth: ['extentsFull', 'extentsOver150', 'extentsOver300', 'extentsOver600'] } },
      },
      {
        id: 'extentsOver300',
        esriStyleLayerId: `${sourceLayer}/300-600mm/1`,
        showInKey: false,
        visibleWhen: { menu: { ...visibleWhenMenu, depth: ['extentsFull', 'extentsOver150', 'extentsOver300'] } },
      },
      {
        id: 'extentsOver150',
        esriStyleLayerId: `${sourceLayer}/150-300mm/1`,
        showInKey: false,
        visibleWhen: { menu: { ...visibleWhenMenu, depth: ['extentsFull', 'extentsOver150'] } },
      },
      {
        id: 'extentsFull',
        esriStyleLayerId: `${sourceLayer}/<150mm/1`,
        showInKey: false,
        visibleWhen: { menu: { ...visibleWhenMenu, depth: ['extentsFull'] } },
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
        label: terms.depth.depthOver2300,
        style: {
          fill: { outdoor: colours.depthOver2300.default, dark: colours.depthOver2300.dark },
        }
      },
      {
        id: 'depthOver1200',
        esriStyleLayerId: `${sourceLayer}/1200-2300mm/1`,
        label: terms.depth.depthOver1200,
        style: {
          fill: { outdoor: colours.depthOver1200.default, dark: colours.depthOver1200.dark },
        }
      },
      {
        id: 'depthOver900',
        esriStyleLayerId: `${sourceLayer}/900-1200mm/1`,
        label: terms.depth.depthOver900,
        style: {
          fill: { outdoor: colours.depthOver900.default, dark: colours.depthOver900.dark },
        }
      },
      {
        id: 'depthOver600',
        esriStyleLayerId: `${sourceLayer}/600-900mm/1`,
        label: terms.depth.depthOver600,
        style: {
          fill: { outdoor: colours.depthOver600.default, dark: colours.depthOver600.dark },
        }
      },
      {
        id: 'depthOver300',
        esriStyleLayerId: `${sourceLayer}/300-600mm/1`,
        label: terms.depth.depthOver300,
        style: {
          fill: { outdoor: colours.depthOver300.default, dark: colours.depthOver300.dark },
        }
      },
      {
        id: 'depthOver150',
        esriStyleLayerId: `${sourceLayer}/150-300mm/1`,
        label: terms.depth.depthOver150,
        style: {
          fill: { outdoor: colours.depthOver150.default, dark: colours.depthOver150.dark },
        }
      },
      {
        id: 'depthOverZero',
        esriStyleLayerId: `${sourceLayer}/<150mm/1`,
        label: terms.depth.depthOverZero,
        style: {
          fill: { outdoor: colours.depthOverZero.default, dark: colours.depthOverZero.dark },
        }
      },
    ]
  }
  return [extentsDataset, depthDataset]
}
