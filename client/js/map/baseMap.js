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
  const mapStyles = [{
    id: 'outdoor',
    label: 'Outdoor',
    url: '/map/styles/master-map',
    attribution: osMasterMapAttributionHyperlink,
    thumbnail: '/assets/images/outdoor-map-icon.jpg',
    logo: '/assets/images/outdoor-map-icon.jpg'
  },
  {
    id: 'dark',
    label: 'Dark',
    url: '/map/styles/master-map-dark',
    attribution: osMasterMapAttributionHyperlink,
    thumbnail: '/assets/images/dark-map-icon.jpg',
    logo: '/assets/images/dark-map-icon.jpg'
  },
  {
    id: 'blackAndWhite',
    label: 'Black and white',
    url: '/map/styles/black-and-white-map',
    attribution: osMasterMapAttributionHyperlink,
    thumbnail: '/assets/images/black-and-white-map-icon.jpg',
    logo: '/assets/images/black-and-white-map-icon.jpg'
  }
  ]
  return mapStyles
}

export { setUpBaseMaps }
