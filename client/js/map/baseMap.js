const mapStyles = {}

const setUpBaseMaps = (osAccountNumber) => {
  const currentYear = new Date().getFullYear()
  const osAttributionHyperlink = `<a href="/os-terms" class="os-credits__link"> Contains OS data &copy; Crown copyright and database rights ${currentYear} </a>`
  const osMasterMapAttributionHyperlink = `<a href="/os-terms" class="os-credits__link">&copy; Crown copyright and database rights ${currentYear} OS ${osAccountNumber} </a>`
  Object.assign(mapStyles, {
    outdoor: {
      displayName: 'Outdoor',
      url: '/map/styles/base-map-default',
      attribution: osAttributionHyperlink,
      digitisingUrl: '/map/styles/polygon-default',
      digitisingAttribution: osMasterMapAttributionHyperlink,
      iconUrl: '/assets/images/outdoor-map-icon.jpg'
    },
    dark: {
      displayName: 'Dark',
      url: '/map/styles/base-map-dark',
      attribution: osAttributionHyperlink,
      digitisingUrl: '/map/styles/polygon-default',
      digitisingAttribution: osMasterMapAttributionHyperlink,
      iconUrl: '/assets/images/dark-map-icon.jpg'
    },
    blackAndWhite: {
      displayName: 'Black and white',
      // will be replaced with open version of map and apply over-zoom and wonky road name changes
      url: '/map/styles/base-map-black-and-white',
      attribution: osAttributionHyperlink,
      digitisingUrl: '/map/styles/base-map-black-and-white',
      digitisingAttribution: osMasterMapAttributionHyperlink,
      iconUrl: '/assets/images/black-and-white-map-icon.jpg'
    }
  })

  const baseMapStyles = Object.entries(mapStyles)
    .map(([name, { url, attribution, displayName, iconUrl }]) => ({ name, url, attribution, displayName, iconUrl }))

  const digitisingMapStyles = Object.entries(mapStyles)
    .map(([name, { digitisingUrl: url, digitisingAttribution: attribution, displayName, iconUrl }]) => ({ name, url, attribution, displayName, iconUrl }))

  return { mapStyles, baseMapStyles, digitisingMapStyles }
}

export { setUpBaseMaps }
