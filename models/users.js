'use strict'

var settingsManager = require('./settings')
  , User = require('./user')
  , util = require('util')


module.exports = Users


/**
 * Chat manager
 *
 * @constructor
 * @param {*} io Socket.io manager
 */
function Users(io) {
  this.io = io

  /**
   * Here users are mapped by name
   *
   * @type {Object}
   */
  this.users = {}

  /**
   * Saved message
   *
   * @type {Array}
   */
  this.history = []
}




/**
 * Create & add new user
 *
 * @param {io} socket
 * @returns {User} User object
 */
Users.prototype.create = function(socket) {
  var user = new User(this, socket)
  this.users[user.name] = user

  user.socket.emit('users', this.usersList())
  user.socket.emit('me', user.serialize())
  user.socket.emit('history', this.history)
  this.message(user.name, 'User @' + user.name + ' entered chat', 'new-user')

  return user
}




/**
 * Delete user by name and emit 'user disconnected' event
 *
 * @param {string} name
 */
Users.prototype.deleteByName = function(name) {
  delete this.users[name]

  this.message(name, 'User @' + name + ' left', 'dead-user')
}




/**
 * Get user by name
 *
 * @param {string} name
 * @returns {User} User object or null
 */
Users.prototype.getByName = function(name) {
  return this.users[name] || null
}




/**
 * Send message to all connected users
 *
 * @param {string} sender Name of user who sent message
 * @param {string} message Message string
 * @param {string} type Message type
 */
Users.prototype.message = function(sender, message, type) {
  var msg = [type, sender, message, Date.now()]

  if (this.history.length >= settingsManager.savedMessagesCount) {
    var calls = this.history.length - settingsManager.savedMessagesCount
    while (calls--) this.history.shift()
  }

  this.history.push(msg)
  this.io.emit('message', msg)
}




/**
 * Private message from one user to another
 *
 * @param {string} sender Name of user who sent message
 * @param {string} recipient Name of recipient
 * @param {string} message Message string
 */
Users.prototype.privateMessage = function(sender, recipient, message) {
  var rec = this.getByName(recipient)
  if (!rec) return

  rec.sendPrivateMessage(sender, message)
}




/**
 * Rename user
 *
 * @param {User} user
 * @param {string} newName
 */
Users.prototype.rename = function(user, newName) {
  var oldName = user.name
  delete this.users[oldName]
  this.users[newName] = user

  this.message(user.name, util.format('User @%s changed name to @%s', oldName, newName), 'rename')
}




/**
 * List of users to send to user
 *
 * @returns {Array}
 */
Users.prototype.usersList = function() {
  return Object.keys(this.users).map(function(name) {
    var user = this.users[name]
    return user.serialize()
  }, this)
}