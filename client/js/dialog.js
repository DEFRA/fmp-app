/* global $ */

function openDialog (sel) {
  const $dialog = $(sel)

  $dialog.attr('aria-hidden', 'false')
    .find('.dialog-content input').focus()
  $('body').addClass('modal-open')

  const focusableElements =
"button, [href], input, select, [tabindex]:not([tabindex='-1'])"
  const modal = document.querySelector('#report')
  const focusableElement = modal.querySelectorAll(focusableElements)[1]
  const firstFocusableElement = modal.querySelectorAll(focusableElements)[2]
  const focusableContent = modal.querySelectorAll(focusableElements)
  const lastFocusableElement = focusableContent[focusableContent.length - 1]
  document.addEventListener('keydown', function (e) {
    const isTabPressed = e.key === 'Tab' || e.keyCode === 9
    if (!isTabPressed) {
      return
    }
    if (e.shiftKey) { // if shift key pressed for shift + tab combination
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus() // add focus for the last focusable element
        e.preventDefault()
      }
    } else { // if tab key is pressed
      if (document.activeElement === lastFocusableElement) { // if focused has reached to last focusable element then focus first focusable element after pressing tab
        focusableElement.focus() // add focus for the first focusable element
        e.preventDefault()
      }
    }
  })
  firstFocusableElement.focus()
}

function closeDialog () {
  $('.dialog[aria-hidden=false]')
    .attr('aria-hidden', 'true')
  $('body').removeClass('modal-open')
}
function closeDownloadDialog () {
  $('#report-downloading')
    .attr('aria-hidden', 'true')
}

// Initialise on document ready
$(function init () {
  if ($('.dialog').length > 0) {
    $('button[data-toggle=dialog]').on('click', function (e) {
      e.preventDefault()

      const $this = $(this)
      const target = '#' + $this.attr('data-target')

      openDialog(target)
    })

    $('.dialog-close').on('click', function (e) {
      e.preventDefault()

      closeDialog()
      $('.pdf-download').find('.govuk-button--pdf-download').focus()
    })

    $('.dialog-cancel').on('click', function (e) {
      e.preventDefault()

      closeDialog()
      $('.pdf-download').find('.govuk-button--pdf-download').focus()
    })

    // Document binding events
    $(document).bind({
      keyup: function (e) {
        if (e.keyCode === 27) { // ESC
          closeDialog()
        }
      },
      mousemove: function (e) {
        closeDownloadDialog()
      }

    })
    $('.govuk-button .button').click(function () {
      $('body').removeClass('modal-open')
    })
  }
})

module.exports = {
  openDialog: openDialog,
  closeDialog: closeDialog
}
