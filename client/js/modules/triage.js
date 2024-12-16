const updateLocation = (src) => {
  const button = document.getElementById('continue-button')
  if (button) {
    button.href = src.value
  }
}

Array.from(document.getElementsByName('triage-options')).forEach((element) => {
  element.onclick = () => updateLocation(element)
})
