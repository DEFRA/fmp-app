const helpBannerState = {
  interactiveMap: null,
  dismissed: false,
  hidden: false
}

const HELP_BANNER_ID = 'help-banner'
/**
 * The help banner is the popup that asks users to click on the flood zones for information.
 * It is shown when the map is first loaded, and can be dismissed by the user.
 * Once dismissed, it will not be shown again until the page is refreshed.
 */
export const hideHelpPanel = () => {
  // When the panel is hidden, set a flag so that it is not shown again
  // until showHelpPanel is called.
  // so that it can be hidden temporarily when digitising a polygon,
  // and then shown again when the digitising is complete.
  if (helpBannerState.interactiveMap && !helpBannerState.dismissed) {
    helpBannerState.hidden = true
    helpBannerState.interactiveMap.hidePanel(HELP_BANNER_ID)
  }
}

export const showHelpPanel = () => {
  if (helpBannerState.interactiveMap && !helpBannerState.dismissed) {
    helpBannerState.hidden = false
    helpBannerState.interactiveMap.showPanel(HELP_BANNER_ID)
  }
}

export const addHelpBanner = (interactiveMap) => {
  helpBannerState.interactiveMap = interactiveMap
  interactiveMap.addPanel(HELP_BANNER_ID, {
    label: 'Click on the flood zones for information',
    html: '<span class="im-u-visually-hidden">Alert:</span>',
    mobile: { slot: 'banner', dismissible: true },
    tablet: { slot: 'banner', dismissible: true, width: '372px' },
    desktop: { slot: 'banner', dismissible: true, width: '372px' }
  })

  interactiveMap.on('app:panelclosed', ({ panelId }) => {
    if (panelId === HELP_BANNER_ID && !helpBannerState.hidden) {
      // If the panel is closed by the hideHelpPanel function, then
      // we don't want to set the dismissed flag, as it will be shown
      // again when showHelpPanel is called.
      // If hidden is not set, then the user has dismissed the panel,
      // so we permanently remove the panel
      helpBannerState.dismissed = true
      interactiveMap.removePanel(panelId)
    }
  })
}
