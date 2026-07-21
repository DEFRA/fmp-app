export const menu = [
  {
    id: 'dataset',
    label: 'Datasets',
    urlKey: 'dataset',
    visibleWhen: true,
    type: 'radio', // 'checkbox' or 'radio'
    value: 'floodzones', // this is the default value for the menu, it should be one of the items' id
    items: [
      { id: 'floodzones', label: 'Flood zones' },
      { id: 'surfacewater', label: 'Surface water' },
      { id: 'none', label: 'None', },
    ],
  },
  {
    id: 'timeframe',
    label: 'Timeframe',
    urlKey: 'dataset',
    urlIndex: 1, // eg: surfacewater-presentday-high-depth or floodzones-climatechange
    type: 'radio',
    visibleWhen: { menu: { dataset: ['floodzones', 'surfacewater'] } },
    value: 'presentday',
    items: [
      { id: 'presentday', label: 'Present day' },
      { id: 'climatechange', label: '2070 to 2125', visibleWhen: { menu: { dataset: ['floodzones'] } } },
      { id: 'climatechange', label: '2061 to 2125', visibleWhen: { menu: { dataset: ['surfacewater'] } } },
    ]
  }, {
    id: 'aep',
    label: 'Annual likelihood of flooding',
    urlKey: 'dataset',
    urlIndex: 2,
    type: 'radio',
    visibleWhen: { menu: { dataset: ['surfacewater'] } },
    value: 'medium',
    items: [
      { id: 'high', label: '1 in 30' },
      { id: 'medium', label: '1 in 100' },
      { id: 'low', label: '1 in 1000' },
    ]
  }, {
    id: 'depth',
    label: 'Depth',
    urlKey: 'dataset',
    urlIndex: 3,
    type: 'radio',
    visibleWhen: { menu: { dataset: ['surfacewater'] } },
    subMenu: true,
    value: 'depthAll',
    items: [
      { id: 'depthAll', label: 'All depths', },
      { id: 'depth150', label: 'Full extent of flooding', },
      { id: 'depth300', label: 'Extent over 150mm', },
      { id: 'depth600', label: 'Extent over 300mm', },
      { id: 'depth900', label: 'Extent over 600mm', },
      { id: 'depth1200', label: 'Extent over 900mm', },
      { id: 'depth2300', label: 'Extent over 1200mm', },
      { id: 'depthOver2300', label: 'Extent over 2300mm', },
    ]
  }, {
    id: 'features',
    groupLabel: 'Map features',
    urlKey: 'features',
    type: 'checkbox',
    visibleWhen: true,
    items: [
      { id: 'waterstorage', label: 'Water storage' },
      { id: 'flooddefence', label: 'Flood defence' },
      { id: 'mainrivers', label: 'Main rivers' },
    ]
  }
]
