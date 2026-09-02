const { dimensionsPanelHTML, dimensionsPanelID } = require('./dimensionsPanel.html.js')

const DIMENSIONS_PANEL_ID = 'dimensions-panel'

export class DimensionsPanel {
  constructor (interactiveMap) {
    this._interactiveMap = interactiveMap
  }

  showPanel () {
    this._interactiveMap.addPanel(DIMENSIONS_PANEL_ID, {
      label: 'Dimensions',
      html: dimensionsPanelHTML,
      mobile: { slot: 'drawer', modal: false, open: true },
      tablet: { slot: 'side', width: '280px', open: true, dismissible: false, exclusive: false, },
      desktop: { slot: 'side', width: '280px', open: true, dismissible: false, exclusive: false, }
    })
  }

  hidePanel () {
    this._interactiveMap.removePanel(DIMENSIONS_PANEL_ID)
  }

  setValues (values) {
    const { area = 0, width = 0, height = 0 } = values
    Object.entries({ area, width, height }).forEach(([key, value]) => {
      const element = document.getElementById(dimensionsPanelID(key))
      if (element) {
        element.textContent = value
      }
    })
  }
}
