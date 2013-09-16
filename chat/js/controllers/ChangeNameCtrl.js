'use strict'

define([
  'config',
  'jquery',
  'bootstrap'
], function(config, $) {
  function ChangeNameCtrl($scope, $rootScope, $io) {
    var self = this
    $scope.users = []

    $io.on('users', function(users) {
      $scope.users = users
    })

    $scope.$on('rename', function(evt, data) {
      if (data.oldName === $rootScope.me.name) {
        $rootScope.me.name = data.newName
      }
    })

    $scope.$watch('newName', function() {
      self.validate($scope)
    })

    $scope.saveName = function() {
      if ($scope.error) return

      $io.emit('rename', $scope.newName)
      $(config.renameModalSelector).modal('hide')
    }

    this.registerDOMListeners($scope, $rootScope)
  }




  ChangeNameCtrl.prototype.registerDOMListeners = function($scope, $rootScope) {
    $(config.renameModalSelector).on('show.bs.modal', function() {
      $scope.newName = $rootScope.me.name
    })

    /* Focus on field when modal is shown */
    $(config.renameModalSelector).on('shown.bs.modal', function() {
      $(config.renameFieldSelector).focus()
    })
  }




  /**
   * Validate name
   *
   * @param $scope Controller scope
   */
  ChangeNameCtrl.prototype.validate = function($scope) {
    var duplicate = false
      , i = 0
      , user

    while (user = $scope.users[i++]) {
      if (user.name === $scope.newName) {
        duplicate = true
        break
      }
    }

    if (duplicate) {
      $scope.error = 'User with such name already exists.'
    } else if (!$scope.newName || !$scope.newName.trim()) {
      $scope.error = 'Name must not be empty.'
    } else if ($scope.newName.length < 4) {
      $scope.error = 'Name length must be at least 4 characters.'
    } else if ($scope.newName.trim().match(/\s/)) {
      $scope.error = 'Name must not contain spaces.'
    } else {
      $scope.error = null
    }
  }

  return ChangeNameCtrl
})