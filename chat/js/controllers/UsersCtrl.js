'use strict'

define([], function() {
  function UsersCtrl($scope, $rootScope, $io, geoDistance) {
    $scope.users = []

    $io.on('users', function(users) {
      $scope.users = users
        users.forEach(function(user) {
            user.distance = geoDistance.distance($rootScope.me.ll, user.ll)
        });
    })

      $scope.getUser = function(name) {
      var i = 0
        , user

      while (user = $scope.users[i++]) {
        if (user.name === name) {
          return user
        }
      }

      return null
    }

    $scope.locationString = function(user) {
      var location = []

      user.country && location.push(user.country)
      user.state && location.push(user.state)
      user.city && location.push(user.city)

      return location.join(', ')
    }

    $scope.startPrivate = function(user) {
      $rootScope.$broadcast('start private', user.name)
    }

    /* New one connected */
    $scope.$on('new-user', function(event, user) {
      if (!$scope.getUser(user.name) && user.name !== $rootScope.me.name) {
        user.distance = geoDistance.distance($rootScope.me.ll, user.ll)
        $scope.users.push(user)
      }
    })

    /* User disconnected */
    $scope.$on('dead-user', function(event, name) {
      var i = 0
        , user

      while (user = $scope.users[i]) {
        if (user.name === name) {
          $scope.users.splice(i, 1)
          break
        }

        i++
      }
    })

    /* User renamed */
    $scope.$on('rename', function(event, data) {
      var user = $scope.getUser(data.oldName)
      if (user) {
        user.name = data.newName
      }
    })

  }

  return UsersCtrl
})
