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

    $scope.changeName = function() {
        var modalInstance = $modal.open({
            templateUrl: '/partial/changeNameModal',
            controller: ChangeNameModalCtrl,
            resolve: {
                name: function () {
                    return $scope.name;
                }
            }
        })

        modalInstance.result.then(function(name) {
            //TODO socket
            $scope.name = name
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    }

    $scope.openTab = function(name) {
        for(var i =0; i < $scope.tabs.length; i++) {
            if ($scope.tabs[i].title == name) {
                $scope.tabs[i].active = true
                return
            }
        }
//        $scope.tabs.forEach(function(tab) {
//            if (tab.title == name) {
//                tab.active = true
//                return
//            }
//        })
        $scope.tabs.push({title: name, active: true})
    }

    $scope.textTest = "gfdgfdgf"
    $scope.closeTab = function(tab) {
        var i = $scope.tabs.indexOf(tab);
        if(i != -1) {
            $scope.tabs.splice(i, 1);
        }
    }

    $scope.tabs = [/*{title: 'Tab 1'}, {title: 'Tab 2'}, {title: 'Tab 3'}*/]

    $scope.messages = { Guest_2:
        [{user: 'Guest_1', text: 'Hello world!  :-]', date: 1288323623006}]
    }
    $scope.users = [
        {name: 'Guest_1', location: 'Taganrog, even worse'},
        {name: 'Guest_2', location: 'Hell, 9-th circle'},
        {name: 'Guest_3', location: 'Hell, 7-th circle'},
        {name: 'Guest_4', location: 'Hell, 5-th circle'}
    ]
    $scope.name = 'Guest_1'

}
