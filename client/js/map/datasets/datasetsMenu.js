import { terms } from '../terms.js'

export const initialiseMenu = (datasetsPlugin) => {
  const getCheckboxOnChangeHandler = (datasetId) => (checked) => datasetsPlugin.setDatasetVisibility(checked, { datasetId })
  return [
    {
      id: 'dataset',
      label: terms.labels.datasets,
      urlKey: 'dataset',
      visibleWhen: true,
      type: 'radio', // 'checkbox' or 'radio'
      value: 'floodzones', // this is the default value for the menu, it should be one of the items' id
      items: [
        { id: 'floodzones', label: terms.labels.floodZones },
        { id: 'surfacewater', label: terms.labels.surfaceWater },
        { id: 'none', label: terms.labels.none },
      ],
    },
    {
      id: 'timeframe',
      label: terms.labels.climateChange,
      urlKey: 'dataset',
      urlIndex: 1, // eg: surfacewater-presentday-high-depth or floodzones-climatechange
      type: 'radio',
      visibleWhen: { menu: { dataset: ['floodzones', 'surfacewater'] } },
      value: 'presentday',
      items: [
        { id: 'presentday', label: terms.labels.presentDay },
        { id: 'climatechange', label: terms.labels.floodZoneClimateChange, visibleWhen: { menu: { dataset: ['floodzones'] } } },
        { id: 'climatechange', label: terms.labels.surfaceWaterClimateChange, visibleWhen: { menu: { dataset: ['surfacewater'] } } },
      ]
    }, {
      id: 'aep',
      label: terms.labels.annualLikelihood,
      urlKey: 'dataset',
      urlIndex: 2,
      type: 'radio',
      visibleWhen: { menu: { dataset: ['surfacewater'] } },
      value: 'medium',
      items: [
        { id: 'high', label: terms.chance.swHigh },
        { id: 'medium', label: terms.chance.swMedium },
        { id: 'low', label: terms.chance.swLow },
      ]
    }, {
      id: 'depth',
      label: terms.labels.depth,
      urlKey: 'dataset',
      urlIndex: 3,
      type: 'radio',
      visibleWhen: { menu: { dataset: ['surfacewater'] } },
      subMenu: true,
      value: 'depthAll',
      items: [
        { id: 'depthAll', label: terms.depth.depthAll },
        { id: 'extentsFull', label: terms.depth.extentsFull, },
        { id: 'extentsOver150', label: terms.depth.extentsOver150, },
        { id: 'extentsOver300', label: terms.depth.extentsOver300, },
        { id: 'extentsOver600', label: terms.depth.extentsOver600, },
        { id: 'extentsOver900', label: terms.depth.extentsOver900, },
        { id: 'extentsOver1200', label: terms.depth.extentsOver1200, },
        { id: 'extentsOver2300', label: terms.depth.extentsOver2300, },
      ]
    }, {
      id: 'features',
      groupLabel: terms.labels.mapFeatures,
      urlKey: 'features',
      type: 'checkbox',
      visibleWhen: true,
      items: [
        { id: 'waterstorage', label: terms.labels.waterStorage, handleOnChange: getCheckboxOnChangeHandler('waterstorage') },
        { id: 'flooddefence', label: terms.labels.floodDefence, handleOnChange: getCheckboxOnChangeHandler('flooddefence') },
        { id: 'mainrivers', label: terms.labels.mainRivers, handleOnChange: getCheckboxOnChangeHandler('mainrivers') },
      ]
    }
  ]
}
