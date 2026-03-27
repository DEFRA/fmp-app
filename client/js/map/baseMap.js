const setUpBaseMaps = (osAccountNumber) => {
  const currentYear = new Date().getFullYear()
  const osMasterMapAttributionHyperlink = `<a href="/os-terms" class="os-credits__link">&copy; Crown copyright and database rights ${currentYear} OS ${osAccountNumber} </a>`
  const mapStyles = [
    {
      id: 'outdoor',
      label: 'Outdoor',
      url: '/map/styles/master-map',
      attribution: osMasterMapAttributionHyperlink,
      thumbnail: '/assets/images/outdoor-map-icon.jpg',
      logo: '/assets/images/os-logo.svg'
    },
    {
      id: 'dark',
      label: 'Dark',
      url: '/map/styles/master-map-dark',
      mapColorScheme: 'dark',
      appColorScheme: 'dark',
      attribution: osMasterMapAttributionHyperlink,
      thumbnail: '/assets/images/dark-map-icon.jpg',
      logo: '/assets/images/os-logo-white.svg'
    },
    {
      id: 'blackAndWhite',
      label: 'Black and white',
      url: '/map/styles/black-and-white-map',
      attribution: osMasterMapAttributionHyperlink,
      thumbnail: '/assets/images/black-and-white-map-icon.jpg',
      logo: '/assets/images/os-logo.svg'
    }
  ]
  return mapStyles
}

export { setUpBaseMaps }
