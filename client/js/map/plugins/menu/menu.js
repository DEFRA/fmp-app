import createMenuPlugin from '@defra/interactive-map/plugins/menu'
import { menuConfig } from './menuConfig.js'

export const menuPlugin = createMenuPlugin({
  manifest: {
    panels: [{
      id: 'menu',
      desktop: { open: true, slot: 'side', width: '280px', dismissible: false, exclusive: false },
      tablet: { open: true, slot: 'side', width: '280px', dismissible: false, exclusive: false },
      mobile: { open: false, slot: 'drawer', modal: false, dismissible: true },
    }],
    buttons: [{ id: 'menuButton' }]
  },
  menu: menuConfig
})
