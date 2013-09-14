'use strict'

var BlockError = require('../shared/errors').BlockError
  , MINUTE = 60000
  , q = require('q')
  , settingsManager = require('./settings')
  , SpamError = require('../shared/errors').SpamError
  , URL_REGEXP = /http[s]?:\/\/[0-9A-Za-z-\.@:%_\+~#=]+\/?[a-zA-Z0-9_\-\+\.\/]*\??[a-zA-Z0-9_%&\-\+\.=]*#?[!a-zA-Z0-9_%&\-\+\.=]*/g




/**
 * Validates different events from clients
 *
 * @param {SettingsManager} settingsManager
 * @constructor
 */
function Validator(settingsManager) {
  this.settingsManager = settingsManager
}



/**
 * Mark user as blocked
 *
 * @param {User} user User instance
 */
Validator.prototype.block = function(user) {
  user.blockedAt = Date.now()
}




/**
 * Check if cooldown timer is active for user
 *
 * @param {User} user
 */
Validator.prototype.isBlocked = function(user) {
  var now = Date.now()

  if (!user.blockedAt) {
    return false
  } else if (now - user.blockedAt > this.settingsManager.coolDownTimeout) {
    user.blockedAt = 0
    return false
  }

  return true
}




/**
 * Check if user is spammer
 *
 * @param {User} user User object
 */
Validator.prototype.isSpammer = function(user) {
  var now = Date.now()

  if (user.lastMessageAt === 0 || now - user.lastMessageAt > MINUTE) {
    user.lastMessageAt = now
    user.lastMessages = 1
  } else if (++user.lastMessages > this.settingsManager.maxMessagesPerMin) {
    return true
  }

  return false
}



/**
 * Validate message from user
 *
 * @param {User} user User instance
 * @param {string} message
 * @returns {Q.promise}
 */
Validator.prototype.message = function(user, message) {
  var self = this

  return q
    .fcall(function() {
      if (self.isBlocked(user)) {
        throw new BlockError('You are blocked, dude! :P')
      }
    })
    .then(function spamCheck() {
      if (self.isSpammer(user)) {
        self.block(user)

        throw new SpamError('You, tricky spammer! You\'re blocked! :P')
      }
    })
    .then(function checkForRudeWords() {
      if (!self.validateMessage(user, message)) {
        self.block(user)

        throw new BlockError('You tried to post rude word! Now you\'re blocked! :P')
      }
    })
    .then(function checkForLinks() {
      return self.validateLinks(user, message)
    })
}




/**
 * Alias for {Validator.message}
 */
Validator.prototype.privateMessage = function(user, message) {
  return Validator.prototype.message(user, message)
}




/**
 * Validate new name
 *
 * @param {User} user
 * @param {string} newName
 * @returns {Q.promise}
 */
Validator.prototype.rename = function(user, newName) {
  var self = this

  return q
    .fcall(function() {
      if (self.isBlocked(user)) {
        throw new BlockError('You are blocked, dude! :P')
      }
    })
    .then(function checkForRudeWords() {
      if (!self.validateMessage(user, newName)) {
        self.block(user)
        throw new BlockError('You tried to post rude word! Now you\'re blocked! :P')
      }
    })
}




/**
 * Validate message: check if there're URLs in string
 *
 * @param {User} user User object
 * @param {string} message Message string
 */
Validator.prototype.validateLinks = function(user, message) {
  var settingsManager = this.settingsManager

  return message.replace(URL_REGEXP, function(url) {
    var linkId = settingsManager.addPendingURL(url)

    return '@link:' + linkId + '@'
  })
}




/**
 * Validate message: check black list
 *
 * @param {User} user User object
 * @param {string} message Message string
 */
Validator.prototype.validateMessage = function(user, message) {
  return !this.settingsManager.blacklist.some(function(bad) {
    return ~message.indexOf(bad)
  })
}


module.exports = new Validator(settingsManager)