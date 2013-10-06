'use strict'

var settingsManager = require('./settings')
  , User = require('./user')
  , util = require('util')


module.exports = Users


/**
 * Chat manager
 *
 * @constructor
 * @param {SocketNamespace} io Socket.io namespace
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

  // INFO: reference for settings manager to get users list
  settingsManager.users = this
}




/**
 * Create & add new user
 *
 * @param {string} name User name to ban
 */
Users.prototype.ban = function(name) {
  var user = this.getByName(name)
  if (!user) return

  user.ban()
}




/**
 * Create & add new user
 *
 * @param {Socket} socket
 * @param {Object} session Express session
 * @returns {User} User object
 */
Users.prototype.create = function(socket, session) {
  var user = this.getByName(session.name)
  if (!user) {
    user = new User(this, session, socket)
    this.users[user.name] = user
  }

  socket.emit('me', user.serialize())
  socket.emit('settings', settingsManager.userSettings())
  socket.emit('users', this.usersList(user.name))
  socket.emit('history', this.history.concat(session.history))

  return user
}




/**
 * Delete user by name and emit 'user disconnected' event
 *
 * @param {string} name
 */
Users.prototype.deleteByName = function(name) {
  delete this.users[name]

  this.message(name, name + ' left', 'dead-user', {name: name}, settingsManager.silentUserEnterLeave)

  // notify admin page
  settingsManager.emit('user deleted', name)
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
 * @param {*} [extra] Extra data, whatever
 */
Users.prototype.message = function(sender, message, type, extra, silent) {
  var msg = [type, sender, message, Date.now()]
  if (extra)
    msg.push(extra)
  if (silent) {
    extra.silent = silent
  } else {
    if (this.history.length >= settingsManager.savedMessagesCount) {
      var calls = this.history.length - settingsManager.savedMessagesCount
      while (calls--) this.history.shift()
    }
    this.history.push(msg)
  }
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

  this.message(
    user.name,
    util.format('%s changed name to %s', oldName, newName),
    'rename',
    {oldName: oldName, newName: newName})

  settingsManager.emit('user renamed', {oldName: oldName, newName: newName})
}




/**
 * Reset chat history and emit 'history' event to all the guests
 */
Users.prototype.resetHistory = function() {
  this.history = []
  this.io.emit('history', [])
}




/**
 * List of users to send to user
 *
 * @param {string} exclude Name of user to exclude
 * @returns {Array}
 */
Users.prototype.usersList = function(exclude) {
  var list = []
  Object.keys(this.users).forEach(function(name) {
    if (name === exclude) return

    var user = this.users[name]
    list.push(user.serialize())
  }, this)
  return list
}