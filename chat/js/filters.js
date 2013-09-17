'use strict'

define(['angular'], function(angular) {
  var filters = angular.module('chat.filters', [])
  filters.filter('interval', function() {
    return function(seconds) {
      var mins = Math.floor(seconds / 60)
      seconds -= mins * 60

      var str = ''
      if (!mins) {
        str += '00'
      } else if (mins < 10) {
        str += '0' + mins
      } else {
        str += mins
      }

      str += ':'

      if (!seconds) {
        str += '00'
      } else if (seconds < 10) {
        str += '0' + seconds
      } else {
        str += seconds
      }

      return str
    }
  })
})