function SettingsCtrl($scope, $rootScope, $io) {
  $io.on('settings', function(settings) {
    Object.keys(settings).forEach(function(prop) {
      $rootScope.$apply(function() {
        if (!~['pendingURLs', 'blacklist', 'bannedIPs'].indexOf(prop)) {
          $scope.$watch(prop, function(value) {
            if (!value) return
            $io.emit('update', prop, value)
          })
        }

        $scope[prop] = settings[prop]
      })
    })
  })

  $io.on('pending url', function(pending) {
    $rootScope.$apply(function() {
      $scope.pendingURLs.push(pending)
    })
  })

  $scope.approve = function(idx) {
    var pending = this.pendingURLs[idx]
    $scope.pendingURLs.splice(idx, 1)
    $io.emit('approve url', pending.id)
  }

  $scope.removeRude = function(idx) {
    var rude = this.blacklist[idx]
    this.blacklist.splice(idx, 1)
    $io.emit('remove rude', idx)
  }

  $scope.addRude = function() {
    this.blacklist.push($scope.newRude)
    $io.emit('add rude', $scope.newRude)
    $scope.newRude = ''
  }

  $scope.removeIP = function(idx) {
    var ip = this.bannedIPs[idx]
    this.bannedIPs.splice(idx, 1)
    $io.emit('remove ip', idx)
  }

  $scope.addIP = function() {
    this.bannedIPs.push($scope.newIP)
    $io.emit('add ip', $scope.newIP)
    $scope.newIP = ''
  }
}