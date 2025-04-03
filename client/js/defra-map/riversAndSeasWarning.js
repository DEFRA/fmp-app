const bannerMarkUp = `
<span class="govuk-warning-text__icon" aria-hidden="true">!</span>
<strong class="govuk-warning-text__text">
  <span class="govuk-visually-hidden">Warning</span> Rivers and sea data layers may present inconsitencies.
</strong>
<a id="rivers-and-seas-link" class="fm-c-btn">Find out more</a>
<button class="fm-c-btn fm-c-btn--close-panel govuk-body-s" aria-label="Close panel">
  <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 20 20">
    <path 
      d="M10,8.6L15.6,3L17,4.4L11.4,10L17,15.6L15.6,17L10,11.4L4.4,17L3,15.6L8.6,10L3,4.4L4.4,3L10,8.6Z" 
      style="fill: currentcolor; stroke: currentcolor; stroke-width: 0.1;">
    </path>
  </svg>
</button>`

const infoPopUpMarkUp = `
<div class="fm-c-panel__body" tabindex="-1">
  <div class="fm-c-panel__content" id='rivers-and-seas-disclaimer-panel'>
    <p class="govuk-body">
      River and sea data may present data inconsistencies due to alternate selected models 
      being used across risk levels and defended status.
    </p>
    <p class="govuk-body">
      Flood zones have not been affected, and remain the recomended dataset for planning and flood risk assessments.
    </p>
    <p class="govuk-body">
      <a href="">Find out more about the data and what it can be used for.</a>
    </p>
  </div>
</div>`

const state = {
  bannerDismissed: false,
  infoDismissed: false
}

const bannerElement = document.createElement('div')
bannerElement.setAttribute('class', 'govuk-warning-text')
bannerElement.setAttribute('id', 'rivers-and-seas-banner')
bannerElement.innerHTML = bannerMarkUp

bannerElement.addEventListener('click', (event) => {
  if (event.target.id === 'rivers-and-seas-link') {
    // showInfoPanel()
    state.infoDismissed = false
    onRiversAndSeasMenuItem()
  } else {
    // state.bannerDismissed = true
    onRiversAndSeasMenuItem()
  }
  event.preventDefault()
})

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

const isRiversAndSeas = () => state?.mapState?.segments && state?.mapState?.segments.find((item) => item === 'rsd' || item === 'rsu')

const initialiseRiversAndSeasWarnings = (mapState, floodMap) => {
  Object.assign(state, { mapState, floodMap })

  // const topElement = document.querySelector('.fm-o-top')
  const mapElement = document.querySelector('#map')
  if (mapElement) {
    mapElement.insertBefore(bannerElement, mapElement.firstElementChild)
    // mapElement.appendChild(bannerElement)
  }
  onRiversAndSeasMenuItem()
}

const onRiversAndSeasMenuItem = (selected) => {
  // showBanner(state.infoDismissed && !state.bannerDismissed && isRiversAndSeas())
  showBanner(isRiversAndSeas())
  if (isRiversAndSeas() && !state.infoDismissed) {
    showInfoPanel()
  }
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

export { onRiversAndSeasMenuItem, initialiseRiversAndSeasWarnings }
