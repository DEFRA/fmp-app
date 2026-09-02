export const getDimensionsPanelIdValue = (label) => `im-c-dimensions-panel-value-${label.toLowerCase()}`

const dimensionsPanelListItem = (label, units) => {
  const itemId = getDimensionsPanelIdValue(label)
  return `
  <div class="im-c-dimensions-panel-list__item">
    <dt class="im-c-dimensions-panel-list__item-key">
      ${label}
    </dt>
    <dd class="im-c-dimensions-panel-list__item-value">
      <span id="${itemId}">0</span> ${units}
    </dd>
  </div>`
}

export const dimensionsPanelHTML = `<div class="im-c-panel__body">
  <div class="im-c-dimensions-panel im-c-dimensions-panel--has-groups">
    <dl class="im-c-dimensions-panel-list">
      ${dimensionsPanelListItem('Area', 'Ha')}
      ${dimensionsPanelListItem('Width', 'm')}
      ${dimensionsPanelListItem('Height', 'm')}
    </dl>
  </div>
</div>`
