const bannerMarkUp = `
<span class="govuk-warning-text__icon" aria-hidden="true">!</span>
<strong class="govuk-warning-text__text">
  <span class="govuk-visually-hidden">Warning</span> Rivers and sea data may show inconsistent results.
</strong>
<a id="rivers-and-seas-link" class="fm-c-btn" href = '/how-to-use-rivers-and-sea-data'>Find out more</a>
`

const infoPopUpMarkUp = `
<div class="fm-c-panel__body" tabindex="-1">
  <div class="fm-c-panel__content" id='rivers-and-seas-disclaimer-panel'>
    <p class="govuk-body">
      River and sea data may present data inconsistencies due to alternate selected models
      being used across risk levels and defended status.
    </p>
    <p class="govuk-body">
      Flood zones have not been affected, and remain the recommended dataset for planning and flood risk assessments.
    </p>
    <p class="govuk-body">
      <a href="">Find out more about the data and what it can be used for.</a>
    </p>
  </div>
</div>`

const state = { infoDismissed: false }

const bannerElement = document.createElement('div')
bannerElement.setAttribute('class', 'govuk-warning-text')
bannerElement.setAttribute('id', 'rivers-and-seas-banner')
bannerElement.innerHTML = bannerMarkUp

const showBanner = (show) => {
  const mapElement = document.querySelector('#map')
  if (show) {
    mapElement.classList.add('rivers-and-seas-disclaimer')
  } else {
    mapElement.classList.remove('rivers-and-seas-disclaimer')
  }
  bannerElement.style.display = show ? 'flex' : 'none'
}

showBanner(false)

const showInfoPanel = () => {
  state.floodMap.setInfo({
    width: '360px',
    label: 'River and sea data disclaimer',
    html: infoPopUpMarkUp
  })
}

document.addEventListener('click', e => {
  const elementClicked = e.target
  if (elementClicked.classList.contains('fm-c-btn--close-panel')) {
    if (elementClicked.parentElement.parentElement.querySelector('#rivers-and-seas-disclaimer-panel')) {
      state.infoDismissed = true
      onRiversAndSeasMenuItem()
    }
  }
})

const isRiversAndSeas = () => state?.mapState?.segments && state?.mapState?.segments.find((item) => item === 'rsd' || item === 'rsu')

const initialiseRiversAndSeasWarnings = (mapState, floodMap) => {
  Object.assign(state, { mapState, floodMap })

  const mapElement = document.querySelector('#map .fm-o-container .fm-o-side')
  if (mapElement) {
    mapElement.insertAdjacentElement('afterend', bannerElement)
  }
  onRiversAndSeasMenuItem()
}

const onRiversAndSeasMenuItem = (selected) => {
  showBanner(isRiversAndSeas())
  if (isRiversAndSeas() && !state.infoDismissed) {
    showInfoPanel()
  }
}

export { onRiversAndSeasMenuItem, initialiseRiversAndSeasWarnings }
