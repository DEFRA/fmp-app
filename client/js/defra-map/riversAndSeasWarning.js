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

const infoPopUpMarkUp = `<div class="fm-c-panel__body" tabindex="-1"><div class="fm-c-panel__content"><dl class="govuk-summary-list govuk-!-margin-bottom-3"><div class="govuk-summary-list__row">
  <dt class="govuk-summary-list__key govuk-!-width-one-half">
  <span class="govuk-body-s">
    <strong>Easting and northing</strong>
  </span>
</dt> <dd class="govuk-summary-list__value">
  <span class="govuk-body-s">
    376449,166220
  </span>
</dd>
</div><div class="govuk-summary-list__row">
  <dt class="govuk-summary-list__key govuk-!-width-one-half">
  <span class="govuk-body-s">
    <strong>Timeframe</strong>
  </span>
</dt> <dd class="govuk-summary-list__value">
  <span class="govuk-body-s">
    Present day
  </span>
</dd>
</div><div class="govuk-summary-list__row">
  <dt class="govuk-summary-list__key govuk-!-width-one-half">
  <span class="govuk-body-s">
    <strong>Dataset</strong>
  </span>
</dt> <dd class="govuk-summary-list__value">
  <span class="govuk-body-s">
    River and sea with defences
  </span>
</dd>
</div><div class="govuk-summary-list__row">
  <dt class="govuk-summary-list__key govuk-!-width-one-half">
  <span class="govuk-body-s">
    <strong>Annual exceedance probability (AEP)</strong>
  </span>
</dt> <dd class="govuk-summary-list__value">
  <span class="govuk-body-s">
    <p class="govuk-body-s">3.3% (1 in 30)<br>chance of flooding each year <br></p><p></p>
  </span>
</dd>
</div></dl></div>
<details class="govuk-details govuk-!-font-size-16" "=""> <summary class="govuk-details__summary"> <span class="govuk-details__summary-text">River and sea data disclaimer</span></summary><div class="govuk-details__text"><p>River and sea data may present data inconsistencies due to alternate selected models being used across risk levels and defended status.</p>
<p>Flood zones have not been affected, and remain the recomended dataset for planning and flood risk assessments.</p>
<p><a href="">Find out more about the data and what it can be used for.</a></p></div></details><details class="govuk-details govuk-!-font-size-16" "=""> <summary class="govuk-details__summary"> <span class="govuk-details__summary-text">3.3% (1 in 30) and flood zone 3b</span></summary><div class="govuk-details__text">This data is shown to help local authorities define the functional flood plain, flood zone 3b</div></details></div>`

const bannerElement = document.createElement('div')
bannerElement.setAttribute('class', 'govuk-warning-text')
bannerElement.setAttribute('id', 'rivers-and-seas-banner')
bannerElement.innerHTML = bannerMarkUp

const showElement = (show, element) => (element.style.display = show ? 'flex' : 'none')
showElement(false, bannerElement)

const state = {
  bannerDismissed: false,
  infoDismissed: false
}
const isRiversAndSeas = () => state?.mapState?.segments && state?.mapState?.segments.find((item) => item === 'rsd' || item === 'rsu')

const initialiseRiversAndSeasWarnings = (mapState, floodMap) => {
  Object.assign(state, { mapState, floodMap })

  const topElement = document.querySelector('.fm-o-top')
  if (topElement) {
    topElement.appendChild(bannerElement)
    bannerElement.addEventListener('click', (event) => {
      if (event.target.id === 'rivers-and-seas-link') {
        state.floodMap.setInfo(bannerMarkUp)
      } else {
        state.bannerDismissed = true
        onRiversAndSeasMenuItem()
      }
      event.preventDefault()
    })
  }
  onRiversAndSeasMenuItem()
}

const onRiversAndSeasMenuItem = (selected) => {
  showElement(state.bannerDismissed === false && isRiversAndSeas(), bannerElement)
}

export { onRiversAndSeasMenuItem, initialiseRiversAndSeasWarnings }
