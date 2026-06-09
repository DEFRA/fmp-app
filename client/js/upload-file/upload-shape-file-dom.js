const errorSummary = document.getElementById('errorSummary')
const errorMessage = document.getElementById('errorMessage')

const clearError = () => {
  errorSummary.style.display = 'none'
  errorMessage.textContent = ''
}

const showError = (message) => {
  clearError()
  errorSummary.style.display = 'block'
  errorMessage.textContent = message
}

module.exports = { showError, clearError }
