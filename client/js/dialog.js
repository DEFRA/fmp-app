/* global $ */

var dialogData = {
  lastFocus: null
}

// Open dialog
function openDialog (data, anchor) {
  dialogData.lastFocus = anchor

  var dialog = $(data)

  dialog.attr('aria-hidden', 'false')
    .find('.dialog-content').focus()
    .attr('tabindex', '-1')
}

// Close dialog only if visible
function closeDialog () {
  var dialog = $('.dialog[aria-hidden=false]')

  dialog.attr('aria-hidden', 'true')
    .find('.dialog-content').blur()
    .attr('tabindex', '0')

  if (dialogData.lastFocus) {
    dialogData.lastFocus.focus()
    dialogData.lastFocus.blur()
  }
}

function init () {
  if ($('.dialog').length > 0) {
    $('a[data-toggle=dialog]').on('click', function (e) {
      e.preventDefault()
      e.stopPropagation()

      var anchor = $(this)
      var data = '#' + anchor.attr('data-target')

      openDialog(data, anchor) // Pass data value into function
    })

    // Stop bubbling
    $('.dialog-holder').on('click', function (e) {
      e.stopPropagation()
    })

    $('.dialog-close').on('click', function (e) {
      e.preventDefault()
      e.stopPropagation()

      closeDialog()
    })

    $('.dialog-cancel').on('click', function (e) {
      e.preventDefault()
      e.stopPropagation()

      closeDialog()
    })

    // Document binding events
    $(document).bind({
      click: function (e) {
        closeDialog()
      },

      keyup: function (e) {
        if (e.keyCode === 27) {
          closeDialog()
        }
      }
    })
  }
}

(function () {
  init()
})()

module.exports = {
  openDialog: openDialog,
  closeDialog: closeDialog
}
