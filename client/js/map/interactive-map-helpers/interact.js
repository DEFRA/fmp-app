import createInteractPlugin from '@defra/interactive-map/plugins/interact'
export const interactPlugin = createInteractPlugin({
  markerColor: { outdoor: '#ff0000' },
  // interactionMode: 'marker', // 'auto', 'select', 'marker' // defaults to 'marker'
  // multiSelect: true
})

export const attachInteractPlugin = (interactiveMap) => {
  interactiveMap.on('map:ready', function (e) {
    interactPlugin.enable()
  })
}
