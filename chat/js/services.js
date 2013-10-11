'use strict'

define([
  'angular',
  'config',
  'io'
], function(angular, config, io) {
  var services = angular.module('chat.services', [])

  services.factory('geoDistance', function() {
    return {
      distance: function(ll1, ll2) {
        if (!ll1 || !ll1.length) ll1 = [0, 0]
        if (!ll2 || !ll2.length) ll2 = [0, 0]

        return (ll2[0] - ll1[0]) * (ll2[0] - ll1[0]) + (ll2[1] - ll1[1]) * (ll2[1] - ll1[1])
      }
    }
  })

  services.factory('$io', function($rootScope) {
    var socket = io.connect(config.baseUrl + 'chat')

    return {
      on: function(eventName, callback) {
        socket.on(eventName, function listenerWrapper() {
          var args = arguments
          $rootScope.$apply(function scopeApplied() {
            callback.apply(socket, args)
          })
        })
      },

      emit: function() {
        var slice = [].slice
          , args = slice.call(arguments, 0)

        // handle case $io.emit('...', callback1, callback2, ..., callbackN)
        args.forEach(function argIterator(arg, idx) {
          if (typeof arg === 'function') {
            var callback = arg
            arg[idx] = function callbackWrapper() {
              $rootScope.$apply(function scopeApplied() {
                var args = slice.call(arguments, 0)
                callback.apply(socket, args)
              })
            }
          }
        })

        socket.emit.apply(socket, args)
      }
    }
  })

  services.factory('$timer', function($timeout) {
    /**
     * Timer implementation
     *
     * @constructor
     * @param {number} timeout Timeout in seconds
     */
    function Timer(timeout) {
      if (!(this instanceof Timer)) {
        return new Timer(timeout)
      }

      /**
       * Called when timer stops
       */
      this.onFinish = function() {
      }

      /**
       * Called before count down starts
       */
      this.onStart = function() {
      }

      this.time = timeout
    }

    /**
     * Start timer
     */
    Timer.prototype.start = function() {
      this.onStart()
      this.tick()
    }

    /**
     * Timer tick (1 second)
     */
    Timer.prototype.tick = function() {
      var self = this

      $timeout(function() {
        self.time--

        if (self.time) return self.tick()

        self.onFinish()
      }, 1000)
    }

    return Timer
  })
})