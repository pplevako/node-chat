'use strict'

var BlockError = require('../shared/errors').BlockError
  , events = require('../shared/events')
  , settingsManager = require('../models/settings')
  , Users = require('../models/users')
  , validator = require('../models/validator')


module.exports = function(io) {
  var users = new Users(io)

  settingsManager.on('approved url', function(id, tinyURL) {
    io.emit('approved url', id, tinyURL)
  })

  io.on('connection', function(socket) {
    var user = users.create(socket)

    function error(err) {
      var evt = err.reason || 'error'

      console.error(err) // TODO remove when tested
      socket.emit(evt, err.message)
    }


    function messageRequest(message) {
      validator
        .message(user, message)
        .then(function(message) {
          user.onMessage(message)
        })
        .fail(error)
        .done()
    }


    function privateMessageRequest(message, to) {
      validator
        .message(user, message)
        .then(function(message) {
          user.onPrivateMessage(message, to)
        })
        .fail(error)
        .done()
    }


    function renameRequest(newName) {
      validator
        .rename(user, newName)
        .then(function() {
          user.onRename(newName)
        })
        .fail(error)
        .done()
    }


    function userDisconnected() {
      user.destroy()
    }


    socket.on('message', messageRequest);
    socket.on('private message', privateMessageRequest)
    socket.on('rename', renameRequest)
    socket.on('disconnect', userDisconnected)
  })
}
