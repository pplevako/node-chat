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

    $scope.send = function($event) {
      var message = ($scope.message || '').trim()
        , to = $rootScope.current.name

      if (!message) {
        return
      }

      $scope.disabled = true
      setTimeout(function sendTimeout() {
        $rootScope.$apply(function scopeApplied() {
          $scope.disabled = false

          if (to === config.mainChatLabel) {
            $io.emit('message', message)
          } else {
            $io.emit('private message', message, to)
          }

          $scope.message = ''
        })

        setTimeout(function focusTimeout() {
          $($event.target).find('input[type=text]').focus()
        }, 10)
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
