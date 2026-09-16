import createMapStylesPlugin from '@defra/interactive-map/plugins/map-styles'

export const mapStylePlugin = (osAccountNumber) => {
  const currentYear = new Date().getFullYear()
  const copyRightNotice = `&copy; Crown copyright and database rights ${currentYear} OS ${osAccountNumber}`
  const attribution = `<a href="/os-terms" class="os-credits__link">${copyRightNotice}</a>`
  const logo = '/assets/images/os-logo.svg'
  const whiteLogo = '/assets/images/os-logo-white.svg'

  return createMapStylesPlugin({
    mapStyles: [
      {
        id: 'outdoor',
        label: 'Outdoor',
        url: '/map/styles/master-map',
        attribution,
        thumbnail: '/assets/images/outdoor-map-icon.jpg',
        backgroundColor: '#A9DDEF',
        logo
      },
      {
        id: 'dark',
        label: 'Dark',
        url: '/map/styles/master-map-dark',
        mapColorScheme: 'dark',
        appColorScheme: 'dark',
        attribution,
        thumbnail: '/assets/images/dark-map-icon.jpg',
        logo: whiteLogo
      },
      {
        id: 'blackAndWhite',
        label: 'Black and white',
        url: '/map/styles/black-and-white-map',
        attribution,
        thumbnail: '/assets/images/black-and-white-map-icon.jpg',
        backgroundColor: '#2C2C2C',
        logo
      }
    ],
    manifest: {
      buttons: [{
        id: 'mapStyles',
        desktop: { slot: 'right-top', order: 2, showLabel: false },
        tablet: { slot: 'right-top', order: 2, showLabel: false },
        mobile: { slot: 'right-top', order: 2, showLabel: false }
      }],
      panels: [{
        id: 'mapStyles',
        desktop: { slot: 'map-styles-button', width: '400px', modal: true },
        tablet: { slot: 'map-styles-button', modal: true },
        mobile: { slot: 'map-styles-button', modal: true }
      }]
    }
  })
}
