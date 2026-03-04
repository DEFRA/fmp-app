const mapStyles = {}

// id: 'outdoor',
// label: 'Outdoor',
// url: process.env.OUTDOOR_URL,
// thumbnail: '',
// logo: '/assets/images/os-logo.svg',
// logoAltText: 'Ordnance survey logo',
// attribution: `Contains OS data ${String.fromCharCode(169)} Crown copyright and database rights ${(new Date()).getFullYear()}`,
// backgroundColor: '#f5f5f0'

const setUpBaseMaps = (osAccountNumber) => {
  const currentYear = new Date().getFullYear()
  const osMasterMapAttributionHyperlink = `<a href="/os-terms" class="os-credits__link">&copy; Crown copyright and database rights ${currentYear} OS ${osAccountNumber} </a>`
  Object.assign(mapStyles, {
    outdoor: {
      label: 'Outdoor',
      url: '/map/styles/master-map',
      attribution: osMasterMapAttributionHyperlink,
      digitisingUrl: '/map/styles/master-map',
      digitisingAttribution: osMasterMapAttributionHyperlink,
      logo: '/assets/images/outdoor-map-icon.jpg'
    },
    dark: {
      label: 'Dark',
      url: '/map/styles/master-map-dark',
      attribution: osMasterMapAttributionHyperlink,
      digitisingUrl: '/map/styles/master-map-dark',
      digitisingAttribution: osMasterMapAttributionHyperlink,
      logo: '/assets/images/dark-map-icon.jpg'
    },
    blackAndWhite: {
      label: 'Black and white',
      url: '/map/styles/black-and-white-map',
      attribution: osMasterMapAttributionHyperlink,
      digitisingUrl: '/map/styles/black-and-white-map',
      digitisingAttribution: osMasterMapAttributionHyperlink,
      logo: '/assets/images/black-and-white-map-icon.jpg'
    }
  })

  const baseMapStyles = Object.entries(mapStyles)
    .map(([id, { url, attribution, label, logo }]) => ({ id, url, attribution, label, logo }))

  const digitisingMapStyles = Object.entries(mapStyles)
    .map(([id, { digitisingUrl: url, digitisingAttribution: attribution, label, logo }]) => ({ id, url, attribution, label, logo }))

  return { mapStyles, baseMapStyles, digitisingMapStyles }
}

export { setUpBaseMaps }
