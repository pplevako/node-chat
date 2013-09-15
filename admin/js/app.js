'use strict'

angular
  .module('ca', ['ca.directives', 'ca.filters', 'ca.services'])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', {
        controller: SettingsCtrl
      })
      .otherwise({
        redirectTo: '/scrapers'
      })
  }])