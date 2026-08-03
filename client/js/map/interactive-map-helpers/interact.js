import createInteractPlugin from '@defra/interactive-map/plugins/interact'
export const interactPlugin = createInteractPlugin({
  marker: {
    id: 'infoPanelMarker',
    symbol: 'pin',
    backgroundColor: { outdoor: '#0b0c0c', dark: '#ffffff' },
    foregroundColor: { outdoor: '#ffffff', dark: '#0b0c0c' }
  },
  interactionModes: ['placeMarker'], // e.g. ['selectMarker'], ['selectFeature'], ['placeMarker'], or combinations
})

export const attachInteractPlugin = (interactiveMap) => {
  interactiveMap.on('map:ready', function (e) {
    interactPlugin.enable()
  })
}
