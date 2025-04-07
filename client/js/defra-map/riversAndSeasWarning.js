const bannerMarkUp = `
<span class="govuk-warning-text__icon" aria-hidden="true">!</span>
<strong class="govuk-warning-text__text">
  <span class="govuk-visually-hidden">Warning</span> Rivers and sea data may show inconsistent results.
</strong>
<a id="rivers-and-seas-link" class="fm-c-btn" href = '/how-to-use-rivers-and-sea-data'>Find out more</a>
`

const state = {}

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

const isRiversAndSeas = () => state?.mapState?.segments && state?.mapState?.segments.find((item) => item === 'rsd' || item === 'rsu')

const initialiseRiversAndSeasWarnings = (mapState) => {
  Object.assign(state, { mapState })

  const mapElement = document.querySelector('#map .fm-o-container .fm-o-side')
  if (mapElement) {
    mapElement.insertAdjacentElement('afterend', bannerElement)
  }
  onRiversAndSeasMenuItem()
}

const onRiversAndSeasMenuItem = (selected) => {
  showBanner(isRiversAndSeas())
}

export { onRiversAndSeasMenuItem, initialiseRiversAndSeasWarnings }
