'use strict';

/* Controllers */

var ChangeNameModalCtrl = function($scope, $modalInstance, name) {
  $scope.data = {
    name: name
  }

  $scope.rename = function() {
    $modalInstance.close($scope.data.name)
  }

};

function AppCtrl($scope, socket, $modal) {

  socket.on('me', function(user) {
    $scope.name = user.name
    $scope.location = user.location
  })

  socket.on('users', function(list) {
    $scope.users = list
  })

  socket.on('history', function(history) {
    history.forEach(function(msg) {
      $scope.addMessage(msg)
    })
  })

  $scope.changeName = function() {
    var modalInstance = $modal.open({
      templateUrl: '/partial/changeNameModal',
      controller:  ChangeNameModalCtrl,
      resolve:     {
        name: function() {
          return $scope.name;
        }
      }
    })

    modalInstance.result.then(function(name) {
      scope.emit('rename', name)
      $scope.name = name
    }, function() {
      $log.info('Modal dismissed at: ' + new Date());
    });
  }

  $scope.openTab = function(name) {
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].title == name) {
        $scope.tabs[i].active = true
        return
      }
    }

    $scope.tabs.push({title: name, active: true})
  }

  $scope.textTest = "gfdgfdgf"
  $scope.closeTab = function(tab) {
    var i = $scope.tabs.indexOf(tab);
    if (i != -1) {
      $scope.tabs.splice(i, 1);
    }
  }

  $scope.tabs = [/*{title: 'Tab 1'}, {title: 'Tab 2'}, {title: 'Tab 3'}*/]

  $scope.users = []
  $scope.name = ''
  $scope.messages = {
    '#': []
  }

  $scope.addMessage = function(msg) {
    $scope.messages['#'].push({
      type: msg.shift(),
      user: msg.shift(),
      text: msg.shift(),
      date: msg.shift()
    })
  }

}
