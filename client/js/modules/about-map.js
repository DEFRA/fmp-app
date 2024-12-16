import { setCookie } from './cookies.js'

const element = document.getElementById('dont-show-again')
element.onchange = (element) => {
  if (element.target.checked) {
    setCookie('Skip-changes-to-flood-data', 'true', 30)
  } else {
    setCookie('Skip-changes-to-flood-data', 'true', -365)
  }
}
