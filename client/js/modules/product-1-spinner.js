const form = document.getElementById('product-1-form')
const product1Button = document.getElementById('product-1-button')

const onStartP1Generation = () => {
  product1Button.classList.toggle('loading')
  product1Button.disabled = true
  product1Button.textContent = 'We are generating your PDF, please wait'
}

const onCompletedP1Generation = () => {
  product1Button.classList.toggle('loading')
  product1Button.disabled = false
  product1Button.textContent = 'Download flood map for this location (PDF)'
}

const downloadP1 = async (response) => {
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const downloadElement = document.createElement('a')
  downloadElement.href = url
  const date = new Date().toISOString()
  const filename = `flood-map-planning-${date}.pdf`
  downloadElement.download = filename
  document.body.appendChild(downloadElement)
  downloadElement.click() // Trigger a click event on the link element to initiate the download
  window.URL.revokeObjectURL(url) // Clean up by revoking the blob URL and removing the link element
  document.body.removeChild(downloadElement)
}

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  onStartP1Generation()

  const response = await window.fetch(event.target.action, {
    method: 'POST',
    body: new URLSearchParams(new window.FormData(event.target)) // event.target is the form
  })

  await downloadP1(response)
  onCompletedP1Generation()
})
