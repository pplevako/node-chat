'use strict';

/* Filters */

angular.module('myApp.filters', []).
  filter('emotify', function() {
      return function(text) {
          return emotify(text)
      }
  })
