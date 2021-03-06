'use strict'

var settingsManager
  , geoip = require('./geoip')
  , guestNumber = 1


module.exports = User


/**
 * Reset guest number
 */
module.exports.reset = function() {
  guestNumber = 1
}




function assignGuestName() {
  return 'Guest_' + guestNumber++
}




/**
 * User class
 *
 * @constructor
 * @param {Users} manager Ref to users manager
 * @param {Object} session Express session
 * @param {Socket} socket Socket.io connection
 */
function User(manager, session, socket) {
  this.manager = manager
  this.session = session

  /**
   * User name
   *
   * @type {string}
   */
  if (!session.name) {
    this.name = assignGuestName()
    session.name = this.name
    session.history = []
    session.sockets = []
    session.save()
  } else {
    this.name = session.name
  }


  /**
   * Timestamp: when user was blocked
   *
   * @type {number}
   */
  this.blockedAt = 0

  /**
   * Last message timestamp, updated when more than minute passed
   *
   * @type {number}
   */
  this.lastMessageAt = 0

  /**
   * Counter of messages per minute
   *
   * @type {number}
   */
  this.lastMessages = 0

  this.country = null
  this.city = null

  if (!settingsManager) {
    settingsManager = require('./settings')
  }

  this.addSocket(socket)

  manager.message(
    this.name,
    this.name + ' entered chat',
    'new-user',
    this.serialize(), settingsManager.silentUserEnterLeave)

  settingsManager.emit('user added', {
    name: this.name,
    ip:   this.ip
  })
}




/**
 * Add connection to user object
 *
 * @param {Socket} socket Socket instance
 */
User.prototype.addSocket = function(socket) {
  var idx = this.session.sockets.indexOf(socket.id)
    , addr
  if (idx !== -1) return

  this.session.sockets.push(socket.id)
  this.session.save()

  if (this.ip || !socket || !socket.handshake) {
    return
  } else if (socket.handshake.headers['x-forwarded-for']) {
    addr = socket.handshake.headers['x-forwarded-for']
  } else {
    addr = socket.handshake.address.address
  }

  this.ip = addr
  geoip.applyTo(this, addr)
}




/**
 * Add to message to private messages history
 *
 * @param {string} from Sender of messages
 * @param {string} message Message itself
 * @param {string} chatName Private chat name == name of another guest
 */
User.prototype.addToHistory = function(from, message, chatName) {
  var msg = ['private', from, message, Date.now(), chatName]
  if (this.session.history.length === settingsManager.privateMessagesCount) {
    this.session.history.shift()
  }
  this.session.history.push(msg)
  this.session.save()
}



/**
 * Emit event to all the sockets
 */
User.prototype.ban = function() {
  var args = arguments

  this.session.sockets.forEach(function(id) {
    var io = this.manager.io
      , sock = io.sockets[id]

    if (sock) sock.emit.apply(sock, args)
  }, this)
}



/**
 * Clear private chat history
 */
User.prototype.clearPrivateHistory = function(username) {
  var i = this.session.history.length
    , msg
    , shouldSave = false

  while (i) {
    msg = this.session.history[--i]
    if (msg[1] === username || msg[4] === username) {
      this.session.history.splice(i, 1)
      shouldSave = true
    }
  }

  shouldSave && this.session.save()
}



/**
 * Emit event to all the sockets
 */
User.prototype.emit = function() {
  var args = arguments

  this.session.sockets.forEach(function(id) {
    var io = this.manager.io
      , sock = io.sockets[id]

    sock.emit.apply(sock, args)
  }, this)
}



/**
 * Remove user, delete, destroy, kill, punish, hate people!!11
 */
User.prototype.destroy = function() {
  this.manager.deleteByName(this.name)
}




/**
 * Called when user sends message to global chat
 *
 * @param {string} message
 */
User.prototype.onMessage = function(message) {
  this.manager.message(this.name, message)
}




/**
 * User sent message to other user
 *
 * @param {string} message
 * @param {string} to
 */
User.prototype.onPrivateMessage = function(message, to) {
  this.manager.privateMessage(this.name, to, message)
  this.addToHistory(this.name, message, to)

  this.emit('private message sent', message, to)
}




/**
 * Rename user
 *
 * @param {string} newName
 */
User.prototype.onRename = function(newName) {
  this.manager.rename(this, newName)
  this.name = newName
  this.session.name = newName
  this.session.save()
}




/**
 * Remove connection from user object
 *
 * @param {Socket} socket Socket instance
 */
User.prototype.removeSocket = function(socket) {
  var idx = this.session.sockets.indexOf(socket.id)
  if (idx === -1) return
  this.session.sockets.splice(idx, 1)
  this.session.save()

  if (this.session.sockets.length === 0) {
    this.destroy()
  }
}




/**
 * Send private message to given user from other
 *
 * @param {string} from
 * @param {string} message
 */
User.prototype.sendPrivateMessage = function(from, message) {
  this.addToHistory(from, message, from)

  this.emit('private message', from, message)
}




/**
 * Serialize user
 *
 * @returns {Object}
 */
User.prototype.serialize = function() {
  var out = {}

  out.name = this.name
  out.country = this.country
  out.state = this.state
  out.city = this.city
  out.ll = this.ll

  return out
}