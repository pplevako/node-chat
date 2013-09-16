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

    var generalChatTab = 0

    $scope.activeTab = generalChatTab
    $scope.users = []

    $scope.messages = {
        '#': []
    }
    $scope.tabs = [
        {id: 0, title: '#', close: false, messages: []}
    ]

    $scope.changeName = function() {
        var modalInstance = $modal.open({
            templateUrl: '/partial/changeNameModal',
            controller: ChangeNameModalCtrl,
            resolve: {
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
        var tab = $scope.findOrCreateTab(name)
        tab.active = true
        $scope.activeTab = tab.id
    }

    $scope.findOrCreateTab = function(name) {
        var tab = $scope.findTab(name)
        if (!tab) {
            tab = {id: $scope.tabs.length, title: name, close: true, messages: []}
            $scope.tabs.push(tab)
        }
        return tab
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
        $scope.findTabById(generalChatTab).messages.push(messageData)
        //$scope.tabs['#']
    }

    $scope.findUserByName = function(name) {
        for (var i = 0; i < $scope.users.length; i++) {
            if ($scope.users[i].name === name) {
                return $scope.users[i]
            }
        }
        return null
    }

    $scope.findTab = function(title) {
        for (var i = 0; i < $scope.tabs.length; i++) {
            if ($scope.tabs[i].title === title) {
                return $scope.tabs[i]
            }
        }
        return null
    }

    $scope.getActiveTab = function() {
        return $scope.findTabById($scope.activeTab)
    }

    $scope.findTabById = function(id) {
        for (var i = 0; i < $scope.tabs.length; i++) {
            if ($scope.tabs[i].id === id) {
                return $scope.tabs[i]
            }
        }
        return null
    }

//    $scope.deleteUserByName = function(name) {
//        for (var i = 0; i < $scope.users.length; i++) {
//            if ($scope.users[i].name === name) {
//                array.splice(i, 1)
//                return
//            }
//        }
//    }

    $scope.handleChatEvent = function(data) {
        if (data.type === 'new-user') {
            if (!$scope.findUserByName(data.user)) {
                $scope.users.push(data.extra)
            }

        }
        else if (data.type === 'dead-user') {
            $scope.users.forEach(function(user, idx) {
                if (user.name === data.user) {
                    $scope.users.splice(idx, 1)
                }
            })

        }
        else if (data.type === 'rename') {
            var user = $scope.findUserByName(data.user)
            var tab = $scope.findTab(user.name)
            if (tab)
                tab.title = data.extra
            user.name = data.extra
        }
    }

    $scope.orderLocation = function(user) {
        return !(user.location === $scope.me.location)
    }

    $scope.orderMe = function(user) {
        return !(user === $scope.me)
    }

    $scope.sendMessage = function() {
        if ($scope.activeTab === generalChatTab) {
            socket.emit('message', $scope.message)
        }
        else {
            socket.emit('private message', {message: $scope.message, to: $scope.getActiveTab().title})
        }
        $scope.message = null
    }

    $scope.addPrivateMessage = function(from, to, msg, date) {
        var tab = $scope.findOrCreateTab(from)
        var messageData = {
            user: to,
            text: msg,
            date: date
        }
        tab.messages.push(messageData)
    }


    /* Socket.io listeners */
    this.initIOListeners($scope, socket)
}


AppCtrl.prototype.initIOListeners = function($scope, socket) {
    socket.on('me', function(user) {
        $scope.me = $scope.findUserByName(user.name)
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

    socket.on('private message', function(from, to, msg, date) {
        $scope.addPrivateMessage(from, to, msg, date)
    })
}
