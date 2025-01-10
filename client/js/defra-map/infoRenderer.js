const renderListKey = (value) => `<dt class="govuk-summary-list__key govuk-!-width-one-half">
  <span class="govuk-body-s">
    <strong>${value}</strong>
  </span>
</dt>`

const renderListValue = (value) => `<dd class="govuk-summary-list__value">
  <span class="govuk-body-s">
    ${value}
  </span>
</dd>`

const renderListRow = (key, value) => `<div class="govuk-summary-list__row">
  ${renderListKey(key)} ${renderListValue(value)}
</div>`

const renderList = (valuePairs) => {
  let html = '<dl class="govuk-summary-list govuk-!-margin-bottom-3">'
  valuePairs.forEach(([key, value]) => (html += renderListRow(key, value)))
  html += '</dl>'
  return html
}

const renderInfo = (html, extraContent = '', label = 'Title') => {
  if (!html) {
    return null
  }
  return {
    width: '360px',
    label,
    html: html + extraContent
  }
}

export {
  renderInfo, renderListRow, renderList
}
