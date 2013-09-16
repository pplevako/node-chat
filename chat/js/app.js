define([
  'angular',
  'angular-sanitize',
  'controllers',
  'directives',
  'filters',
  'services'
], function(angular, sanitize, controllers) {
  function initialize() {
    var app = angular.module('chat', ['ngSanitize', 'chat.directives', 'chat.filters', 'chat.services'])

    // init controllers
    for (var name in controllers) {
      if (controllers.hasOwnProperty(name)) {
        app.controller(name, controllers[name])
      }
    }

    angular.bootstrap(document.getElementById('chat'), ['chat'])
  }

  return {
    initialize : initialize
  }
})