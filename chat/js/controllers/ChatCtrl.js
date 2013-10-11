'use strict'

define([
  'utils',
  'controllers/Controller'
], function(utils, Controller) {

  /**
   * Top chat controller
   *
   * @constructor
   * @extends {Controller}
   */
  function ChatCtrl($scope, $io, $timer) {
    Controller.apply(this, arguments)
  }
  utils.inherits(ChatCtrl, Controller)


  /**
   * @see {Controller.addScopeMethods}
   */
  ChatCtrl.prototype.addScopeMethods = function($scope, $io, $timer) {
    $scope.coolDown = function() {
      var timeout = $scope.settings.coolDownTimeout

      $scope.wild = true
      $scope.timer = $timer(timeout, function onFinish() {
        $scope.wild = false
      })
      $scope.timer.start()
    }

    $scope.toggleBlocked = function(blocked) {
      $scope.blocked = blocked
    }

    $scope.toggleDisabled = function(disabled) {
      $scope.disabled = disabled
    }

    $scope.toggleHidden = function(hidden) {
      $scope.hidden = hidden
    }
  }


  /**
   * @see {Controller.addScopeProperties}
   */
  ChatCtrl.prototype.addScopeProperties = function($scope) {
    // User data
    $scope.me = {
      name:    '',
      // geoip data
      country: '',
      region:  '',
      city:    '',
      ll:      [0, 0]
    }

    // Chat options. Updated from server.
    $scope.settings = {}

    // Disabled chat state
    $scope.disabled = false

    // Hidden chat state
    $scope.hidden = false
  }


  /**
   * @see {Controller.applyServices}
   */
  ChatCtrl.prototype.applyServices = function($scope, $io) {
    $io.on('blocked', function onBlocked(blocked) {
      $scope.toggleBlocked(blocked)
    })

    $io.on('cool down', function onCoolDown() {
      $scope.coolDown()
    })

    $io.on('disabled', function onDisable(disabled) {
      $scope.toggleDisabled(disabled)
    })

    $io.on('hide', function onHide(hide) {
      $scope.toggleHidden(hide)
    })

    $io.on('me', function gotUserData(me) {
      $scope.me = me
    })

    $io.on('settings', function gotChatSettings(settings) {
      for (var k in settings) {
        if (settings.hasOwnProperty(k)) {
          $scope.settings[k] = settings[k]
        }
      }
    })

    $io.on('update settings', function updatedSettings(key, value) {
      $scope.settings[key] = value
    })
  }

  return ChatCtrl
})