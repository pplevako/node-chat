'use strict'

var filters = angular.module('ca.filters', [])
filters.filter('cut', function() {
  return function(text, length) {
    if (text.length > length - 3) {
      return text.substring(0, length-3) + '...'
    }

    return text
  }
})