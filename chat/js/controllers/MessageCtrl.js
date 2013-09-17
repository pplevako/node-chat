'use strict'

define([
  'config',
  'jquery'
], function(config, $) {
  function MessageCtrl($scope, $rootScope, $io) {
    $scope.message = ''

    $scope.changeName = function() {
      $(config.renameModalSelector).modal('show')
    }

    $scope.send = function() {
      var message = ($scope.message || '').trim()
        , to = $rootScope.current.name

      if (!message) {
        return
      }

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

    $scope.showSmiles = function() {
      $rootScope.$broadcast('toggle smiles popover')
    }


    $scope.$on('send smile', function(event, smile) {
      $rootScope.$apply(function() {
        $scope.message += smile + ' '
      })

    })
  }

  return MessageCtrl
})
