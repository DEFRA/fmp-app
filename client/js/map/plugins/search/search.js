import createSearchPlugin from '@defra/interactive-map/plugins/search'
import { getRequest as transformRequest } from '../../tokens.js'

const SEARCH_BUTTON_ID = 'map-search'

export const searchPlugin = createSearchPlugin({
  manifest: {
    buttons: [{
      id: 'search',
      mobile: { slot: 'top-right', showLabel: false, order: 1 },
      tablet: { slot: 'top-left', showLabel: true, order: 1 },
      desktop: { slot: 'top-left', showLabel: true, order: 1 },
    }]
  },
  transformRequest, // This will go once the token handling is replaced with a proxy
  placeholder: 'Search for a place in england',
  osNamesURL: 'https://api.os.uk/search/names/v1/find?query={query}&fq=local_type:postcode%20local_type:hamlet%20local_type:village%20local_type:town%20local_type:city%20local_type:suburban_area%20local_type:other_settlement&maxresults=100',
  regions: ['england'],
  width: '300px',
  showMarker: false
})

searchPlugin.hideButton = () => {
  const element = document.getElementById(SEARCH_BUTTON_ID)
  if (element) {
    element.style.display = 'none'
  }
}

searchPlugin.showButton = () => {
  const element = document.getElementById(SEARCH_BUTTON_ID)
  if (element) {
    element.style.display = 'flex'
  }
}

searchPlugin.onOpen = () => searchPlugin?.plugins?.interact?.hideInfoPanel()
searchPlugin.onClosed = () => searchPlugin?.plugins?.interact?.hideInfoPanel()

searchPlugin.attach = (interactiveMap) => {
  // Hide the info panel when the search is opened. In reality, it is already
  // hidden before the search:open event is fired, but we call it here to
  // ensure that the infoPanel marker is also removed.
  interactiveMap.on('search:open', searchPlugin.onOpen)
  // Ironically, we must hide the info panel when the search is closed too.
  // This is because the IM hides just about everything when search is opened,
  // but shows them again once it is closed, so we force it closed here.
  interactiveMap.on('search:close', searchPlugin.onClosed)

  interactiveMap.on('search:match', (event) => {
    interactiveMap.addMarker('search', event.point, {
      label: event.text,
      showLabel: true
    })
  })
}
