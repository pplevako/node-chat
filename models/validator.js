'use strict'

var BlockError = require('../shared/errors').BlockError
  , MINUTE = 60000
  , q = require('q')
  , urlParse = require('url').parse
  , settingsManager = require('./settings')
  , shorturl = require('shorturl')
  , SpamError = require('../shared/errors').SpamError
  , URL_REGEXP = new RegExp('(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.)?([0-9A-Za-z-\\.@:%_+~#=]+)+((\\.[a-zA-Z]{2,4})+)(/(.)*)?(\\?([^ ])+)?', 'g')




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
 * @param {string} [reason] Reason of blocking
 */
Validator.prototype.block = function(user, reason) {
  user.blockedAt = Date.now()
  if (reason) {
    user.socket.emit('block', reason)
  }
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
    user.lastMessageAt = 0
    user.lastMessages = 0
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
      var msg = self.validateMessage(user, message)
      if (msg !== message) {
        self.block(user, 'You tried to post rude word! Now you\'re blocked! :P')
      }

      return msg
    })
    .then(function checkForLinks(message) {
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
      if (newName !== self.validateMessage(user, newName)) {
        self.block(user)
        throw new BlockError('You tried to use rude word! Now you\'re blocked! :P')
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
    , deferred = q.defer()
    , urls = []

  message.replace(URL_REGEXP, function(url) {
    if (url.indexOf('http') !== 0 && url.indexOf('ftp:') !== 0) {
      url = 'http://' + url
    }

    var parsed = urlParse(url)
    if (!~settingsManager.allowedURLDomains.indexOf(parsed.hostname)) {
      return '***'
    } else {
      if (!~urls.indexOf(url)) {
        urls.push(url)
      }

      return url
    }
  })

  +function iterate() {
    if (!urls.length) return deferred.resolve(message)
    var url = urls.shift()

    shorturl(url, 'bit.ly', {
      login:  settingsManager.bitlyLogin,
      apiKey: settingsManager.bitlyKey
    }, function(tinyURL) {
      message = message.replace(url, '<a href="' + tinyURL + '" target="_blank">' + tinyURL + '</a>')
      iterate()
    })
  }()

  return deferred.promise;
}




/**
 * Validate message:
 * 1. check black list words and replace them with ***
 * 2. cut down html
 *
 * @param {User} user User object
 * @param {string} message Message string
 * @returns {string} Updated message string
 */
Validator.prototype.validateMessage = function(user, message) {
  this.settingsManager.blacklist.forEach(function(bad) {
    message = message.split(bad).join('***')
  })

  message = message.replace(/<[^>]+>/g, '')
  return message
}


module.exports = new Validator(settingsManager)