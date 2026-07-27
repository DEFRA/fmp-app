const errorSummary = document.getElementById('errorSummary')
const errorMessage = document.getElementById('errorMessage')

const clearError = () => {
  errorSummary.style.display = 'none'
  errorMessage.textContent = ''
}

const renderBulletedError = ({ text, bullets }) => {
  text.split('\n').forEach((line) => {
    const trimmedLine = line.trim()
    if (!trimmedLine) {
      return
    }

    const message = document.createElement('p')
    message.className = 'govuk-body'
    message.textContent = trimmedLine
    errorMessage.appendChild(message)
  })

  const bulletList = document.createElement('ul')
  bulletList.className = 'govuk-list govuk-list--bullet'

  bullets.forEach((bullet) => {
    const item = document.createElement('li')
    item.textContent = bullet
    bulletList.appendChild(item)
  })

  errorMessage.appendChild(bulletList)
}

const showError = (message) => {
  clearError()
  errorSummary.style.display = 'block'

  if (typeof message === 'object' && message !== null && Array.isArray(message.bullets)) {
    renderBulletedError(message)
    return
  }

  errorMessage.textContent = message
}

module.exports = { showError, clearError }
