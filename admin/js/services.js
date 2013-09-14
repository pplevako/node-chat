'use strict'

var services = angular.module('ca.services', [])
services.factory('$io', function() {
  return io.connect('/dude')
})