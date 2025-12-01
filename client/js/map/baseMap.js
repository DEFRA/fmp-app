const mapStyles = {}

const setUpBaseMaps = (osAccountNumber) => {
  const currentYear = new Date().getFullYear()
  const osMasterMapAttributionHyperlink = `<a href="/os-terms" class="os-credits__link">&copy; Crown copyright and database rights ${currentYear} OS ${osAccountNumber} </a>`
  Object.assign(mapStyles, {
    outdoor: {
      displayName: 'Outdoor',
      url: '/map/styles/master-map',
      attribution: osMasterMapAttributionHyperlink,
      digitisingUrl: '/map/styles/master-map',
      digitisingAttribution: osMasterMapAttributionHyperlink,
      iconUrl: '/assets/images/outdoor-map-icon.jpg'
    },
    dark: {
      displayName: 'Dark',
      url: '/map/styles/master-map-dark',
      attribution: osMasterMapAttributionHyperlink,
      digitisingUrl: '/map/styles/master-map-dark',
      digitisingAttribution: osMasterMapAttributionHyperlink,
      iconUrl: '/assets/images/dark-map-icon.jpg'
    },
    blackAndWhite: {
      displayName: 'Black and white',
      url: '/map/styles/black-and-white-map',
      attribution: osMasterMapAttributionHyperlink,
      digitisingUrl: '/map/styles/black-and-white-map',
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
