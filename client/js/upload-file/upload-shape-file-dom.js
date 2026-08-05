const errorSummary = document.getElementById('errorSummary')
const errorSummaryText = document.getElementById('errorSummaryText')
const fileInput = document.getElementById('boundary')
const formGroup = fileInput?.closest('.govuk-form-group')
const dropZone = document.getElementsByClassName('govuk-drop-zone')

const getOrCreateErrorDetail = () => {
  let errorDetail = document.getElementById('errorDetail')
  if (!errorDetail) {
    errorDetail = document.createElement('p')
    errorDetail.id = 'errorDetail'
    errorDetail.className = 'govuk-error-message'
    const hiddenSpan = document.createElement('span')
    hiddenSpan.className = 'govuk-visually-hidden'
    hiddenSpan.textContent = 'Error:'
    errorDetail.appendChild(hiddenSpan)
    dropZone[0].insertAdjacentElement('beforebegin', errorDetail)
  }
  return errorDetail
}

const clearError = () => {
  errorSummary.style.display = 'none'
  errorSummaryText.textContent = ''
  const errorDetail = document.getElementById('errorDetail')
  if (errorDetail) {
    errorDetail.remove()
  }
  formGroup?.classList.remove('govuk-form-group--error')
  fileInput?.classList.remove('govuk-file-upload--error')
}

const renderBulletedError = ({ summary, text, bullets }) => {
  const errorDetail = getOrCreateErrorDetail()
  errorSummaryText.textContent = summary

  text.split('\n').forEach((line) => {
    const trimmedLine = line.trim()
    if (!trimmedLine) {
      return
    }

    const message = document.createElement('span')
    message.style.display = 'block'
    message.style.marginBottom = '15px'
    message.textContent = trimmedLine
    errorDetail.appendChild(message)
  })

  const bulletList = document.createElement('ul')
  bulletList.className = 'govuk-list govuk-list--bullet'

  bullets.forEach((bullet) => {
    const item = document.createElement('li')
    item.className = 'govuk-error-message'
    item.style.display = 'list-item'
    item.textContent = bullet
    bulletList.appendChild(item)
  })

  errorDetail.appendChild(bulletList)
}

const showError = (message) => {
  clearError()
  errorSummary.style.display = 'block'
  formGroup?.classList.add('govuk-form-group--error')
  fileInput?.classList.add('govuk-file-upload--error')

  if (typeof message === 'object' && message !== null) {
    if (Array.isArray(message.bullets)) {
      renderBulletedError(message)
      return
    }
    const errorDetail = getOrCreateErrorDetail()
    errorSummaryText.textContent = message.summary
    errorDetail.appendChild(document.createTextNode(' ' + message.text))
    return
  }

  const errorDetail = getOrCreateErrorDetail()
  errorSummaryText.textContent = message
  errorDetail.appendChild(document.createTextNode(' ' + message))
}

module.exports = { showError, clearError, getOrCreateErrorDetail }
