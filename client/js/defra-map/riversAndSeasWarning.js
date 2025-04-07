const bannerMarkUp = `
<span class="govuk-warning-text__icon" aria-hidden="true">!</span>
<div class='govuk-warning-text__inner'>
  <strong class="govuk-warning-text__text">
    <span class="govuk-visually-hidden">Warning</span> Rivers and sea data may show inconsistent results.
  </strong>
  <span class="govuk-warning-text__link">
    <a id="rivers-and-seas-link" class="govuk-link" href="/how-to-use-rivers-and-sea-data">Find out more</a>
  </span>
</div>
`

const infoPopUpMarkUp = `
  <p class="govuk-body" id='rivers-and-seas-disclaimer-panel'>
    Rivers and sea supporting data is given to help you further investigate flood risk.
  </p>
  <p class="govuk-body">
    <a href="/how-to-use-rivers-and-sea-data">Find out more about this data and how it should be used.</a>
  </p>
  <p class="govuk-body"> In some locations the rivers and sea supporting data may show inconsistent results. </p>
  <p class="govuk-body"> The flood zones are not affected by this issue. </p>`

const state = { infoDismissed: false }

const bannerElement = document.createElement('div')
bannerElement.setAttribute('class', 'govuk-warning-text')
bannerElement.setAttribute('id', 'rivers-and-seas-banner')
bannerElement.setAttribute('role', 'status')


const showBanner = (show) => {
  const mapElement = document.querySelector('#map')
  if (show) {
    bannerElement.innerHTML = bannerMarkUp
    mapElement.classList.add('rivers-and-seas-disclaimer')
  } else {
    bannerElement.innerHTML = ''
    mapElement.classList.remove('rivers-and-seas-disclaimer')
  }
  // bannerElement.style.display = show ? 'flex' : 'none'
}

showBanner(false)

const showInfoPanel = () => {
  state.floodMap.setInfo({
    width: '360px',
    label: 'How to use rivers and sea data',
    html: infoPopUpMarkUp
  })
}

document.addEventListener('click', e => {
  const elementClicked = e.target
  if (elementClicked.classList.contains('fm-c-btn--close-panel' &&
    elementClicked.parentElement.parentElement.querySelector('#rivers-and-seas-disclaimer-panel'))) {
    state.infoDismissed = true
    onRiversAndSeasMenuItem()
  }
})

const isRiversAndSeas = () => state?.mapState?.segments.find((item) => item === 'rsd' || item === 'rsu')

const initialiseRiversAndSeasWarnings = (mapState, floodMap) => {
  Object.assign(state, { mapState, floodMap })

  const mapElement = document.querySelector('#map .fm-o-container .fm-o-main')
  if (mapElement) {
    mapElement.insertAdjacentElement('beforebegin', bannerElement)
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
