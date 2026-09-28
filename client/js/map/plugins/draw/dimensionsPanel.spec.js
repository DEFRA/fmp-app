const { DimensionsPanel, DIMENSIONS_PANEL_ID } = require('./dimensionsPanel.js')

describe('DimensionsPanel', () => {
  let interactiveMap
  let panel

  beforeEach(() => {
    document.body.innerHTML = `
      <span id="im-c-dimensions-panel-value-area">0</span>
      <span id="im-c-dimensions-panel-value-width">0</span>
      <span id="im-c-dimensions-panel-value-height">0</span>
    `
    interactiveMap = {
      addPanel: jest.fn(),
      removePanel: jest.fn()
    }
    panel = new DimensionsPanel(interactiveMap)
  })

  describe('showPanel', () => {
    it('should add the dimensions panel with the expected id and layout', () => {
      panel.showPanel()

      expect(interactiveMap.addPanel).toHaveBeenCalledWith(DIMENSIONS_PANEL_ID, expect.objectContaining({
        label: 'Dimensions',
        focus: false
      }))
    })
  })

  describe('hidePanel', () => {
    it('should remove the dimensions panel', () => {
      panel.hidePanel()

      expect(interactiveMap.removePanel).toHaveBeenCalledWith(DIMENSIONS_PANEL_ID)
    })
  })

  describe('setValues', () => {
    it('should set the area, width and height text content', () => {
      panel.setValues({ area: '1.23', width: '10', height: '20' })

      expect(document.getElementById('im-c-dimensions-panel-value-area').textContent).toBe('1.23')
      expect(document.getElementById('im-c-dimensions-panel-value-width').textContent).toBe('10')
      expect(document.getElementById('im-c-dimensions-panel-value-height').textContent).toBe('20')
    })

    it('should default to 0 for any missing value', () => {
      panel.setValues({})

      expect(document.getElementById('im-c-dimensions-panel-value-area').textContent).toBe('0')
      expect(document.getElementById('im-c-dimensions-panel-value-width').textContent).toBe('0')
      expect(document.getElementById('im-c-dimensions-panel-value-height').textContent).toBe('0')
    })

    it('should not throw when the elements are not in the DOM', () => {
      document.body.innerHTML = ''

      expect(() => panel.setValues({ area: 1, width: 2, height: 3 })).not.toThrow()
    })
  })

  describe('setFeatureValues', () => {
    it('should zero the values when there is no feature', () => {
      panel.setFeatureValues(null)

      expect(document.getElementById('im-c-dimensions-panel-value-area').textContent).toBe('0')
      expect(document.getElementById('im-c-dimensions-panel-value-width').textContent).toBe('0')
      expect(document.getElementById('im-c-dimensions-panel-value-height').textContent).toBe('0')
    })

    it('should compute and display the area/width/height for a small polygon and hide the warning', () => {
      const feature = { geometry: { coordinates: [[[0, 0], [100, 0], [100, 100], [0, 100], [0, 0]]] } }

      panel.setFeatureValues(feature)

      expect(document.getElementById('im-c-dimensions-panel-value-area').textContent).toBe('1')
      expect(document.getElementById('im-c-dimensions-panel-value-width').textContent).toBe('100')
      expect(document.getElementById('im-c-dimensions-panel-value-height').textContent).toBe('100')
      expect(interactiveMap.removePanel).toHaveBeenCalledWith('BOUNDARY_WARNING')
    })

    it('should show the oversize boundary warning when the area is 300 hectares or more', () => {
      // 1750m x 1750m = 306.25 hectares
      const side = 1750
      const feature = { geometry: { coordinates: [[[0, 0], [side, 0], [side, side], [0, side], [0, 0]]] } }

      panel.setFeatureValues(feature)

      expect(interactiveMap.addPanel).toHaveBeenCalledWith('BOUNDARY_WARNING', expect.objectContaining({
        label: 'Boundary must be under 300 hectares to order data. You can still download a flood map.'
      }))
    })

    it('should not throw for a feature with no coordinates', () => {
      const feature = { geometry: {} }

      expect(() => panel.setFeatureValues(feature)).not.toThrow()
    })
  })

  describe('showWarning / hideWarning', () => {
    it('should add the boundary warning panel as a non-dismissible banner', () => {
      panel.showWarning()

      expect(interactiveMap.addPanel).toHaveBeenCalledWith('BOUNDARY_WARNING', expect.objectContaining({
        mobile: { slot: 'banner', dismissible: false },
        tablet: { slot: 'banner', dismissible: false },
        desktop: { slot: 'banner', dismissible: false }
      }))
    })

    it('should remove the boundary warning panel', () => {
      panel.hideWarning()

      expect(interactiveMap.removePanel).toHaveBeenCalledWith('BOUNDARY_WARNING')
    })
  })
})
