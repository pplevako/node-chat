'use strict'

define(['angular', 'socket.io'], function(angular, io) {
  var services = angular.module('chat.services', [])

  services.factory('$io', function($rootScope) {
    var socket = io.connect('/chat')

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
})