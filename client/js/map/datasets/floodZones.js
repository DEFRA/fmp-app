export const floodZonesDatasets = ({ agolVectorTileUrl, layerNameSuffix }) => {
  const datasetFloodZonesCC = {
    id: 'floodzonescc',
    label: 'Flood Zones Climate Change',
    groupLabel: 'Datasets',
    esriGroupId: 'floodzones-group',
    tiles: `${agolVectorTileUrl}/Flood_Zones_2_and_3_Rivers_and_Sea_CCP1${layerNameSuffix}/VectorTileServer`,
    showInKey: true,
    visible: true,
    sourceLayer: 'Flood Zones 2 and 3 Rivers and Sea CCP1',
    sublayers: [
      {
        id: 'climate-change',
        label: 'Climate change (2070 to 2125)',
        esriStyleLayerId: 'Flood Zones 2 and 3 Rivers and Sea CCP1/Flood Zones plus climate change/1',
        showInKey: true,
        visibleWhen: {
          menu: {
            dataset: ['floodzones'], timeframe: ['climatechange']
          }
        },
        style: {
          fill: { outdoor: '#F4A582', dark: '#BF3D4A' },
          stroke: 'none'
        },
      },
      {
        id: 'data-unavailable',
        label: 'Climate change data unavailable',
        showInKey: true,
        visibleWhen: {
          menu: {
            dataset: ['floodzones'], timeframe: ['climatechange']
          }
        },
        style: { // This is used just for the key - so that it renders the pattern correctly.
          fillPattern: 'dot',
          fillPatternForegroundColor: { outdoor: '#000000', dark: '#ffffff' },
          stroke: { outdoor: '#000000', dark: '#FFFFFF' },
        }
      },
      {
        id: 'data-unavailable-outline',
        showInKey: false,
        visibleWhen: {
          menu: { dataset: ['floodzones'], timeframe: ['climatechange'] }
        },
        style: {
          stroke: { outdoor: '#000000', dark: '#FFFFFF' },
        },
        esriStyleLayerId: 'Flood Zones 2 and 3 Rivers and Sea CCP1/Unavailable/0'
      },
      {
        id: 'data-unavailable-light',
        visibleWhen: {
          mapStyleId: ['outdoor', 'black-and-white'],
          menu: { dataset: ['floodzones'], timeframe: ['climatechange'] }
        },
        esriStyleLayerId: 'Flood Zones 2 and 3 Rivers and Sea CCP1/Unavailable/1',
        esriUseServerStyle: true,
        showInKey: false,
      },
      {
        id: 'data-unavailable-dark',
        visibleWhen: {
          menu: { dataset: ['floodzones'], timeframe: ['climatechange'] },
          mapStyleId: ['dark']
        },
        esriStyleLayerId: 'Flood Zones 2 and 3 Rivers and Sea CCP1/Unavailable/2',
        esriUseServerStyle: true,
        showInKey: false,
      }
    ]
  }

  const datasetFloodZones = {
    id: 'floodzones',
    label: 'Flood Zones',
    groupLabel: 'Datasets',
    esriGroupId: 'floodzones-group',
    tiles: `${agolVectorTileUrl}/Flood_Zones_2_and_3_Rivers_and_Sea${layerNameSuffix}/VectorTileServer`,
    showInKey: true,
    sourceLayer: 'Flood Zones 2 and 3 Rivers and Sea',
    visibleWhen: {
      menu: { dataset: ['floodzones'] }
    },
    sublayers: [
      {
        id: 'flood-zone-2',
        label: 'Flood Zone 2',
        esriStyleLayerId: 'Flood Zones 2 and 3 Rivers and Sea/Flood Zone 2/1',
        style: {
          fill: { outdoor: '#1d70b8', dark: '#7fcdbb' },
          stroke: 'none'
        },
      },
      {
        id: 'flood-zone-3',
        label: 'Flood Zone 3',
        esriStyleLayerId: 'Flood Zones 2 and 3 Rivers and Sea/Flood Zone 3/1',
        style: {
          fill: { outdoor: '#003078', dark: '#e5f5e0' },
          stroke: 'none'
        },
      }
    ]
  }
  return [datasetFloodZonesCC, datasetFloodZones]
}
