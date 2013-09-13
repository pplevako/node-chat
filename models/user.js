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
  this.name = assignGuestName()

  if (!geoip.applyTo(this, socket.handshake.address)) {
    this.country = null
    this.city = null
  }
}




/**
 * Remove user
 *
 * @param {string} message
 */
User.prototype.onDestroy = function() {
  this.manager.deleteByName(this.name)
}




/**
 * Called when user sends message to global chat
 *
 * @param {string} message
 */
User.prototype.onMessage = function(message) {
  this.socket.broadcast.emit('message', this.name, message)
}




/**
 * User sent message to other user
 *
 * @param {string} message
 * @param {string} to
 */
User.prototype.onPrivateMessage = function(message, to) {
  var other = this.manager.getByName(to)
  if (!other) return

  other.sendPrivate(this.name, message)
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
 * @param {string} from
 * @param {string} message
 */
User.prototype.sendPrivate = function(from, message) {
  this.socket.emit('private messsage', from, message)
}


User.prototype.serialize = function() {
  var out = {}
  out.name = this.name
  if (this.country) {
    out.location = this.country
  } else {
    out.location = null
  }
  if (this.city) {
    out.location += ', ' + this.city
  }

  return out
}