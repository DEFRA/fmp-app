const { dimensionsPanelHTML, getDimensionsPanelIdValue } = require('./dimensionsPanel.html.js')

describe('getDimensionsPanelIdValue', () => {
  it('should lowercase the label and prefix it with the dimensions panel id', () => {
    expect(getDimensionsPanelIdValue('Area')).toBe('im-c-dimensions-panel-value-area')
    expect(getDimensionsPanelIdValue('Width')).toBe('im-c-dimensions-panel-value-width')
    expect(getDimensionsPanelIdValue('Height')).toBe('im-c-dimensions-panel-value-height')
  })
})

describe('dimensionsPanelHTML', () => {
  it('should render a value element for area, width and height with their units', () => {
    document.body.innerHTML = dimensionsPanelHTML

    const area = document.getElementById('im-c-dimensions-panel-value-area')
    const width = document.getElementById('im-c-dimensions-panel-value-width')
    const height = document.getElementById('im-c-dimensions-panel-value-height')

    expect(area.textContent).toBe('0')
    expect(width.textContent).toBe('0')
    expect(height.textContent).toBe('0')
    expect(area.closest('dd').textContent.trim()).toBe('0 ha')
    expect(width.closest('dd').textContent.trim()).toBe('0 m')
    expect(height.closest('dd').textContent.trim()).toBe('0 m')
  })

  it('should label each row as Area, Width and Height', () => {
    document.body.innerHTML = dimensionsPanelHTML

    const labels = [...document.querySelectorAll('.im-c-dimensions-panel-list__item-key')].map((el) => el.textContent.trim())

    expect(labels).toEqual(['Area', 'Width', 'Height'])
  })
})
