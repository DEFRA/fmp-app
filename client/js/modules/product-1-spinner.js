const form = document.getElementById('product-1-form')
const product1Button = document.getElementById('product-1-button')

const onStartP1Generation = () => {
  product1Button.blur()
  product1Button.classList.toggle('loading')
  product1Button.textContent = 'We are preparing your PDF, please wait'
  setTimeout(() => {
    product1Button.focus()
  }, 100)
}

const onCompletedP1Generation = () => {
  product1Button.classList.toggle('loading')
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
if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (product1Button.classList.contains('loading')) {
      return
    }
    onStartP1Generation()

    const response = await window.fetch(event.target.action, {
      method: 'POST',
      body: new URLSearchParams(new window.FormData(event.target)) // event.target is the form
    })

    if (response.status === 200) {
      await downloadP1(response)
    } else {
      const downloadP1Failed = document.getElementById('downloadP1Failed')
      downloadP1Failed.classList.remove('hidden')
    }

    onCompletedP1Generation()
  })
}
