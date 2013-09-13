'use strict'

var User = require('./user')
  , events = require('../constants/events')


module.exports = Users




/**
 *
 * @param io
 * @constructor
 */
function Users(io) {
  this.io = io
  this.users = {}
}




Users.prototype.create = function(socket) {
  var user = new User(this, socket)
  this.users[user.name] = user

  this.io.sockets.emit(events.to['user connected'], user.name)

  return user
}




Users.prototype.deleteByName = function(name) {
  delete this.users[name]

  this.io.sockets.emit(events.to['user disconnected'], name)
}




Users.prototype.getByName = function(name) {
  return this.users[name]
}




/**
 *
 * @private
 * @param {User} user
 * @param {string} newName
 */
Users.prototype.rename = function(user, newName) {
  var oldName = user.name
  delete this.users[user.name]
  this.users[newName] = user

  this.io.sockets.emit('vampire', oldName, newName)
}