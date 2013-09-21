function SettingsCtrl($scope, $rootScope, $io) {
  $scope.users = []

  $io.on('settings', function(settings) {
    Object.keys(settings).forEach(function(prop) {
      $rootScope.$apply(function() {
        if (!~['allowedDomains', 'users', 'blacklist', 'bannedIPs'].indexOf(prop)) {
          $scope.$watch(prop, function(value) {
            if (typeof value === 'undefined') return
            $io.emit('update', prop, value)
          })
        }

        $scope[prop] = settings[prop]
      })
    })
  })

  $io.on('user added', function(user) {
    $rootScope.$apply(function() {
      $scope.users.push(user)
    })
  })

  $io.on('user deleted', function(name) {
    $rootScope.$apply(function() {
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
  })

  $io.on('user renamed', function(data) {
    $rootScope.$apply(function() {
      var i = 0
        , user

      while (user = $scope.users[i]) {
        if (user.name === data.oldName) {
          user.name = data.newName
          break
        }
        i++
      }
    })
  })

  $scope.removeDomain = function(idx) {
    var domain = this.allowedURLDomains[idx]
    this.allowedURLDomains.splice(idx, 1)
    $io.emit('remove domain', idx)
  }

  $scope.addDomain = function() {
    this.allowedURLDomains.push($scope.newDomain)
    $io.emit('add domain', $scope.newDomain)
    $scope.newDomain = ''
  }

  $scope.removeAllowed = function(idx) {
    var domain = this.allowedDomains[idx]
    this.allowedDomains.splice(idx, 1)
    $io.emit('remove allowed', idx)
  }

  $scope.addAllowed = function() {
    this.allowedDomains.push($scope.newAllowed)
    $io.emit('add allowed', $scope.newAllowed)
    $scope.newAllowed = ''
  }

  $scope.removeIP = function(idx) {
    var ip = this.bannedIPs[idx]
    this.bannedIPs.splice(idx, 1)
    $io.emit('remove ip', idx)
  }

  $scope.addIP = function(ip) {
    this.bannedIPs.push(ip || $scope.newIP)
    $io.emit('add ip', ip || $scope.newIP)
    $scope.newIP = ''
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

  $scope.ban = function(idx) {
    var user = $scope.users[idx]
    $scope.users.splice(idx, 1)

    $scope.addIP(user.ip)
    $io.emit('ban', user.name)
  }
}