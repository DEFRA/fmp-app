import createSearchPlugin from '@defra/interactive-map/plugins/search'
import { getRequest as transformRequest } from '../../tokens.js'

export const searchPlugin = createSearchPlugin({
  manifest: {
    buttons: [{
      id: 'search',
      mobile: { slot: 'top-right', showLabel: false, order: 1 },
      tablet: { slot: 'top-left', showLabel: true, order: 1 },
      desktop: { slot: 'top-left', showLabel: true, order: 1 },
    }],
    controls: [{
      id: 'search',
      mobile: { slot: 'top-right' },
      tablet: { slot: 'top-left', order: 2 },
      desktop: { slot: 'top-left', order: 2 },
    }],
  },
  transformRequest, // This will go once the token handling is replaced with a proxy
  placeholder: 'Search for a place in england',
  osNamesURL: 'https://api.os.uk/search/names/v1/find?query={query}&fq=local_type:postcode%20local_type:hamlet%20local_type:village%20local_type:town%20local_type:city%20local_type:suburban_area%20local_type:other_settlement&maxresults=100',
  regions: ['england'],
  width: '300px',
  showMarker: false
})

export const attachSearchPlugin = (interactiveMap, { onOpen, onClosed }) => {
  if (onOpen) {
    interactiveMap.on('search:open', onOpen)
  }
  if (onClosed) {
    interactiveMap.on('search:close', onClosed)
  }
}
