'use strict'

define([
  'config',
  'jquery',
  'bootstrap'
], function(config, $) {
  function MessageCtrl($scope, $rootScope, $io) {
    $scope.changeName = function() {
      $(config.renameModalSelector).modal('show')
    }

    $scope.send = function() {
      var message = $scope.message
        , to = $rootScope.current.name

      $scope.disabled = true
      setTimeout(function() {
        $rootScope.$apply(function() {
          $scope.disabled = false

          if (to === config.mainChatLabel) {
            $io.emit('message', message)
          } else {
            $io.emit('private message', message, to)

            // notify MessagesCtrl that we sent private message
            $rootScope.$broadcast('private message sent', message, to)
          }

          $scope.message = ''
        })
      }, config.lockTimeout)
    }
  }

  return MessageCtrl
})
