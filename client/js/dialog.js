/* global $ */

function openDialog (sel) {
  var $dialog = $(sel)

  $dialog.attr('aria-hidden', 'false')
    .find('.dialog-content input').focus()
  $('body').addClass('modal-open')
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

      var $this = $(this)
      var target = '#' + $this.attr('data-target')

      openDialog(target)
    })

    $('.dialog-close').on('click', function (e) {
      e.preventDefault()

      closeDialog()
    })

    $('.dialog-cancel').on('click', function (e) {
      e.preventDefault()

      closeDialog()
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
