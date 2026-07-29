const helpBannerState = {
  interactiveMap: null,
  dismissed: false,
  hidden: false
}

export const hideHelpPanel = () => {
  if (helpBannerState.interactiveMap && !helpBannerState.dismissed) {
    helpBannerState.hidden = true
    helpBannerState.interactiveMap.hidePanel('help-banner')
  }
}

export const showHelpPanel = () => {
  if (helpBannerState.interactiveMap && !helpBannerState.dismissed) {
    helpBannerState.hidden = false
    helpBannerState.interactiveMap.showPanel('help-banner')
  }
}

export const addHelpBanner = (interactiveMap) => {
  helpBannerState.interactiveMap = interactiveMap
  interactiveMap.addPanel('help-banner', {
    label: 'Click on the flood zones for information',
    html: '<span class="im-u-visually-hidden">Alert:</span>',
    mobile: { slot: 'banner', dismissible: true },
    tablet: { slot: 'banner', dismissible: true, width: '372px' },
    desktop: { slot: 'banner', dismissible: true, width: '372px' }
  })

  interactiveMap.on('app:panelclosed', ({ panelId }) => {
    if (panelId === 'help-banner' && !helpBannerState.hidden) {
      helpBannerState.dismissed = true
      interactiveMap.removePanel(panelId)
    }
  })
}
