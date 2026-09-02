import { dimensionsPanelHTML, getDimensionsPanelIdValue } from './dimensionsPanel.html.js'
import { getAreaInHectares, getDimensions } from '../../../../server/services/shape-utils.js'
import { terms } from '../terms.js'

export const DIMENSIONS_PANEL_ID = 'dimensions-panel'

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
      const element = document.getElementById(getDimensionsPanelIdValue(key))
      if (element) {
        element.textContent = value
      }
    })
  }

  setFeatureValues (feature) {
    if (!feature) {
      this.setValues({ area: 0, width: 0, height: 0 })
      return
    }
    const polygon = feature?.geometry?.coordinates?.[0] || []
    const area = getAreaInHectares(polygon)
    const { width, height } = getDimensions(polygon)
    if (area >= 300) {
      this.showWarning()
      // setTimeout(() => {
      //   this._interactiveMap.showHint(terms.labels.oversizeBoundaryWarning, { duration: 0 })
      // }, 200)
    } else {
      // this._interactiveMap.dismissHint()
      this.hideWarning()
    }

    this.setValues({ area, width, height })
  }

  showWarning () {
    this._interactiveMap.addPanel('BOUNDARY_WARNING', {
      label: terms.labels.oversizeBoundaryWarning,
      html: '<span class="im-u-visually-hidden">Alert:</span>',
      mobile: { slot: 'banner', dismissible: true },
      tablet: { slot: 'banner', dismissible: true, width: '718px' },
      desktop: { slot: 'banner', dismissible: true, width: '718px' }
    })
  }

  hideWarning () {
    this._interactiveMap.removePanel('BOUNDARY_WARNING')
  }
}
