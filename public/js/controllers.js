'use strict'

/* Controllers */

var ChangeNameModalCtrl = function($scope, $modalInstance, name) {
  $scope.data = {
    name: name
  }

  $scope.rename = function() {
    $modalInstance.close($scope.data.name)
  }

}

function AppCtrl($scope, socket, $modal, $log) {
  var type2class = {
    'new-user': 'text-warning',
    'dead-user': 'text-error',
    'rename': 'text-info'
  }

  $scope.users = []
  $scope.name = ''

  $scope.messages = {
    '#': []
  }
  $scope.tabs = [{title: '#'}]


  $scope.changeName = function() {
    var modalInstance = $modal.open({
      templateUrl: '/partial/changeNameModal',
      controller:  ChangeNameModalCtrl,
      resolve:     {
        name: function() {
          return $scope.name
        }
      }
    })

    modalInstance.result.then(function(name) {
      socket.emit('rename', name)
      $scope.name = name
    }, function() {
      $log.info('Modal dismissed at: ' + new Date())
    })
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

  $scope.closeTab = function(tab) {
    var i = $scope.tabs.indexOf(tab)
    if (i != -1) {
      $scope.tabs.splice(i, 1)
    }
  }

  $scope.addMessage = function(msg, isOld) {
    var messageData = {
      type: msg.shift(),
      user: msg.shift(),
      text: msg.shift(),
      date: msg.shift()
    }

    if (messageData.type) {
      messageData.class = type2class[messageData.type]
      if (msg.length) {
        messageData.extra = msg.shift()
      }

      !isOld && $scope.handleChatEvent(messageData)
    }

    $scope.messages['#'].push(messageData)
  }

  $scope.handleChatEvent = function(data) {
    if (data.type === 'new-user') {
      var alreadyHas = $scope.users.forEach(function(user) {
        return (user.name === data.name)
      })

      !alreadyHas && $scope.users.push(data.extra)
    } else if (data.type === 'dead-user') {
      $scope.users.forEach(function(user, idx) {
        if (user.name === data.name) {
          $scope.users.splice(idx, 1)
        }
      })
    }
  }

  $scope.sendMessage = function() {
    socket.emit('message', $scope.message)
    $scope.message = null
  }


  /* Socket.io listeners */
  this.initIOListeners($scope, socket)
}


AppCtrl.prototype.initIOListeners = function($scope, socket) {
  socket.on('me', function(user) {
    $scope.name = user.name
    $scope.location = user.location
  })

  socket.on('users', function(list) {
    $scope.users = list
  })

  socket.on('history', function(history) {
    history.forEach(function(msg) {
      $scope.addMessage(msg, true)
    })
  })

  socket.on('message', function(msg) {
    $scope.addMessage(msg, false)
  })
}
