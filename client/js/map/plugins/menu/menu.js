import createMenuPlugin from '@defra/interactive-map/plugins/menu'
import { menuConfig } from './menuConfig.js'

export const menuPlugin = createMenuPlugin({
  manifest: {
    panels: [{
      id: 'menu',
      desktop: { open: true, slot: 'side', width: '280px', dismissible: false, exclusive: false, },
      tablet: { slot: 'side', width: '280px', modal: true }
    }],
    buttons: [
      {
        id: 'menuButton',
        excludeWhen: ({ appState }) => (appState?.breakpoint === 'desktop'),
      }
    ]
  },
  menu: menuConfig
})
