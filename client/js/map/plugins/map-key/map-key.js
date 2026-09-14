import createMapKeyPlugin from '@defra/interactive-map/plugins/map-key'
import { siteBoundary } from '../../interactive-map-helpers/siteBoundary.js'
import { terms } from '../../terms.js'

export const mapKeyPlugin = createMapKeyPlugin({
  groups: {
    'surface-water-depth-in-millimetres': {
      groupLabel: 'Surface water depth in millimetres',
      groupStyle: 'horizontal-ramp'
    }
  },
  manifest: {
    panels: [{
      id: 'mapKey',
      tablet: { slot: 'left-top', width: '360px', open: true },
      desktop: { slot: 'left-top', width: '360px', open: true },
    }]
  },
})

const siteBoundaryKeyDefinition = {
  id: 'site-boundary',
  label: terms.labels.locationBoundary,
  // groupLabel: 'Other features',
  style: {
    strokeWidth: 2,
    fill: 'none',
    stroke: { outdoor: '#D4351D', dark: '#ffffff' }
  },
}

siteBoundary.onSetFeature = (feature) => {
  if (feature) {
    mapKeyPlugin.addKeyItem(siteBoundaryKeyDefinition)
  } else {
    mapKeyPlugin.removeKeyItem(siteBoundaryKeyDefinition)
  }
}
