const banner = document.createElement('div')
banner.id = 'help-banner'
banner.className = 'fm-c-banner fm-o-top__column'

const getInnerHTML = (areaText) => `<div class="fm-c-banner__inner">
  <div role="status" class="fm-c-banner__content">
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" stroke-width="1.5"></circle>
      <path d="M8.584 5.228h2.832v2.174L10.869 11H9.118l-.534-3.598V5.228zm.098 7.207h2.643v2.337H8.682v-2.337z" fill="currentColor"></path>
    </svg>
    <span>
      <span class="fm-u-visually-hidden">Alert:</span> 
        Click on the ${areaText} for information
      </span>
  </div>
  <button onclick="renderBanner(false)" class="fm-c-btn" aria-label="Close panel">
    <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 20 20">
      <path 
        d="M10,8.6L15.6,3L17,4.4L11.4,10L17,15.6L15.6,17L10,11.4L4.4,17L3,15.6L8.6,10L3,4.4L4.4,3L10,8.6Z"
        style="fill: 
        currentcolor; 
        stroke: currentcolor; 
        stroke-width: 0.1;"
      ></path>
    </svg>
  </button>
</div>`

let dismissed = false

const removeBanner = () => {
  const container = document.querySelector('.flood-map-target > .fm-o-container .fm-o-top')
  if (container.contains(banner)) {
    banner.remove()
  }
}

const renderBanner = (mapState) => {
  if (dismissed || mapState === false) {
    dismissed = true
    removeBanner()
    return
  }

  let areaText = null
  if (!(mapState.type === 'drawMode' || mapState.mode === 'frame' || mapState.mode === 'vertex')) {
    if (mapState.isFloodZone) {
      areaText = 'flood zones'
    } else if (mapState.segments.includes('sw')) {
      areaText = 'surface water areas'
    }
  }

  if (areaText) {
    banner.innerHTML = getInnerHTML(areaText)
    const lastChild = document.querySelector('.flood-map-target > .fm-o-container .fm-o-top .fm-o-top__column:last-child')
    lastChild.before(banner)
  } else {
    removeBanner()
  }
}

window.renderBanner = renderBanner

export { renderBanner }
