'use strict'

define([
  'utils'
], function(utils) {

  function MainCtrl($scope, $rootScope, $io) {
    $rootScope.me = {
      name: '',
      country: '',
      state: '',
      city: ''
    }

    this.registerIOListeners($scope, $rootScope, $io)
  }




  MainCtrl.prototype.registerIOListeners = function($scope, $rootScope, $io) {
    /** User object */
    $io.on('me', function(me) {
      $rootScope.me = me
    })

    /** Client chat settings */
    $io.on('settings', function(settings) {
      for (var k in settings) {
        if (settings.hasOwnProperty(k)) {
          $scope[k] = settings[k]
        }
      }
    })

    /** Handle message in case it has some special type */
    $io.on('message', function(data) {
      var msg = utils.toMessageObject(data)

      if (msg.type) {
        $scope.$broadcast(msg.type, msg.extra)
      }
    })

    function coolDown() {
      // if already counting
      if ($scope.interval) return

      $scope.blocked = Math.ceil($scope.coolDownTimeout / 1000)

      $scope.interval = setInterval(function() {
        $rootScope.$apply(function() {
          $scope.blocked--

          if (!$scope.blocked) {
            clearInterval($scope.interval)
            delete $scope.interval
          }
        })

      }, 1000)
    }

    $io.on('block', coolDown)
    $io.on('spam', coolDown)
  }


  return MainCtrl
})
