'use strict'

var geoip = require('./geoip')
  , guestNumber = 1


module.exports = User




function assignGuestName() {
  return 'Guest_' + guestNumber++
}




/**
 * User class
 *
 * @constructor
 * @param {Users} manager
 * @param {io.Socket} socket
 */
function User(manager, socket) {
  this.manager = manager
  this.socket = socket

  /**
   * User name
   *
   * @type {string}
   */
  this.name = assignGuestName()

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

  var addr
  if (socket.handshake.headers['x-forwarded-for']) {
    addr = socket.handshake.headers['x-forwarded-for']
  } else {
    addr = socket.handshake.address.address
  }
  geoip.applyTo(this, addr)
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
}




/**
 * Rename user
 *
 * @param {string} newName
 */
User.prototype.onRename = function(newName) {
  this.manager.rename(this, newName)
  this.name = newName
}




/**
 * Send private message to given user from other
 *
 * @param {string} from
 * @param {string} message
 */
User.prototype.sendPrivateMessage = function(from, message) {
  this.socket.emit('private message', from, message)
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

  return out
}