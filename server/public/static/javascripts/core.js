(function (window) {
  var utils = {
    xhr: function (url, callback) {
      var xmlhttp = new window.XMLHttpRequest()

      xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
          try {
            var json = JSON.parse(this.responseText)
            callback(null, json)
          } catch (err) {
            callback(err)
          }
        } else {

        }
      }

      xmlhttp.open('GET', url, true)
      xmlhttp.send()
    },
    forEach: function (items, callback) {
      for (var i = 0; i < items.length; i++) {
        callback.call(items, items[i], i)
      }
    },
    addOrUpdateParameter: function (uri, paramKey, paramVal) {
      var re = new RegExp('([?&])' + paramKey + '=[^&#]*', 'i')
      // Delete parameter and value
      if (paramVal === '') {
        uri = uri.replace(re, '')
      } else if (re.test(uri)) {
      // Replace parameter value
        uri = uri.replace(re, '$1' + paramKey + '=' + paramVal)
      // Add parameter and value
      } else {
        var separator = /\?/.test(uri) ? '&' : '?'
        uri = uri + separator + paramKey + '=' + paramVal
      }
      return uri
    },
    getParameterByName: function (name) {
      var v = window.location.search.match(new RegExp('(?:[\?\&]' + name + '=)([^&]+)'))
      return v ? v[1] : null
    }
  }

  // "flood" represents the global namespace for
  // client-side javascript across all our pages
  window.flood = {
    utils: utils
  }
})(window)
