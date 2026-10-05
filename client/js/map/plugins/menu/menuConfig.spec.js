const { menuConfig } = require('./menuConfig.js')

const findGroup = (id) => menuConfig.find((group) => group.id === id)

describe('menuConfig', () => {
  it('should define 5 top-level menu groups', () => {
    expect(menuConfig.map((group) => group.id)).toEqual(['dataset', 'timeframe', 'aep', 'depth', 'features'])
  })

  describe('dataset group', () => {
    it('should be a radio group labelled "Datasets" defaulting to flood zones', () => {
      const dataset = findGroup('dataset')

      expect(dataset.label).toBe('Datasets')
      expect(dataset.type).toBe('radio')
      expect(dataset.value).toBe('floodzones')
      expect(dataset.visibleWhen).toBe(true)
    })

    it('should offer flood zones, surface water and none options', () => {
      const dataset = findGroup('dataset')

      expect(dataset.items).toEqual([
        { id: 'floodzones', label: 'Flood zones' },
        { id: 'surfacewater', label: 'Surface water' },
        { id: 'none', label: 'None' }
      ])
    })
  })

  describe('timeframe group', () => {
    it('should be a radio group labelled "Climate change" defaulting to present day, visible for flood zones/surface water', () => {
      const timeframe = findGroup('timeframe')

      expect(timeframe.label).toBe('Climate change')
      expect(timeframe.type).toBe('radio')
      expect(timeframe.value).toBe('presentday')
      expect(timeframe.visibleWhen).toEqual({ menu: { dataset: ['floodzones', 'surfacewater'] } })
    })

    it('should label the climate change option differently for flood zones vs surface water', () => {
      const timeframe = findGroup('timeframe')
      const [presentDay, floodZoneCc, surfaceWaterCc] = timeframe.items

      expect(presentDay).toEqual({ id: 'presentday', label: 'Present day' })
      expect(floodZoneCc).toEqual({
        id: 'climatechange',
        label: '2070 to 2125',
        visibleWhen: { menu: { dataset: ['floodzones'] } }
      })
      expect(surfaceWaterCc).toEqual({
        id: 'climatechange',
        label: '2061 to 2125',
        visibleWhen: { menu: { dataset: ['surfacewater'] } }
      })
    })
  })

  describe('aep group', () => {
    it('should be a radio group labelled "Annual likelihood of flooding", only visible for surface water', () => {
      const aep = findGroup('aep')

      expect(aep.label).toBe('Annual likelihood of flooding')
      expect(aep.type).toBe('radio')
      expect(aep.value).toBe('medium')
      expect(aep.visibleWhen).toEqual({ menu: { dataset: ['surfacewater'] } })
    })

    it('should offer high/medium/low annual exceedance probability options with their literal chance labels', () => {
      const aep = findGroup('aep')

      expect(aep.items).toEqual([
        { id: 'high', label: '1 in 30' },
        { id: 'medium', label: '1 in 100' },
        { id: 'low', label: '1 in 1000' }
      ])
    })
  })

  describe('depth group', () => {
    it('should be a radio sub-menu labelled "Depth in millimetres", only visible for surface water', () => {
      const depth = findGroup('depth')

      expect(depth.label).toBe('Depth in millimetres')
      expect(depth.type).toBe('radio')
      expect(depth.subMenu).toBe(true)
      expect(depth.value).toBe('depthAll')
      expect(depth.visibleWhen).toEqual({ menu: { dataset: ['surfacewater'] } })
    })

    it('should offer an "all depths" option plus every extents band with its literal label', () => {
      const depth = findGroup('depth')

      expect(depth.items).toEqual([
        { id: 'depthAll', label: 'All depths' },
        { id: 'extentsFull', label: 'Full extent of flooding' },
        { id: 'extentsOver150', label: 'Extent over 150mm' },
        { id: 'extentsOver300', label: 'Extent over 300mm' },
        { id: 'extentsOver600', label: 'Extent over 600mm' },
        { id: 'extentsOver900', label: 'Extent over 900mm' },
        { id: 'extentsOver1200', label: 'Extent over 1200mm' },
        { id: 'extentsOver2300', label: 'Extent over 2300mm' }
      ])
    })
  })

  describe('features group', () => {
    it('should be a checkbox group grouped under "Map features", always visible', () => {
      const features = findGroup('features')

      expect(features.groupLabel).toBe('Map features')
      expect(features.type).toBe('checkbox')
      expect(features.visibleWhen).toBe(true)
    })

    it('should offer water storage, flood defence and main rivers options', () => {
      const features = findGroup('features')

      expect(features.items).toEqual([
        { id: 'waterstorage', label: 'Water storage' },
        { id: 'flooddefence', label: 'Flood defence' },
        { id: 'mainrivers', label: 'Main rivers' }
      ])
    })
  })
})
