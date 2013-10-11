'use strict'

var config = require('../config')
  , EventEmitter = require('events').EventEmitter
  , fs = require('fs')
  , path = require('path')
  , urlParse = require('url').parse
  , User = require('./user')
  , util = require('util')




/**
 * Settings manager
 *
 * @constructor
 * @extends {EventEmitter}
 * @param {Object} config Configuration
 */
function SettingsManager(config) {
  EventEmitter.call(this);

  var self = this
    , key

  for (key in config) {
    this[key] = config[key]
  }

  setInterval(function() {
    if (!self.changed) {
      return
    }

    self.changed = false
    var configPath = path.join(__dirname, '../config.json')
      , out = self.serialize()

    delete out.users

    fs.writeFile(configPath, JSON.stringify(out, null, ' '), function(err) {
      if (err) console.error(err)
    })
  }, 2000)

  /**
   * Ref to users manager instance
   *
   * @type {Users}
   */
  this.users = null
}
util.inherits(SettingsManager, EventEmitter)




/**
 * Add allowed domain
 *
 * @param {string} allowed Valid domain name, I hope
 */
SettingsManager.prototype.addAllowed = function(allowed) {
  this.allowedDomains.push(allowed)
  this.changed = true
}




/**
 * Add allowed URL domain
 *
 * @param {string} domain Valid domain name, I hope
 */
SettingsManager.prototype.addDomain = function(domain) {
  this.allowedURLDomains.push(domain)
  this.changed = true
}




/**
 * Add IP to banned list
 *
 * @param {string} ip IP address
 */
SettingsManager.prototype.addIP = function(ip) {
  this.bannedIPs.push(ip)
  this.changed = true
}




/**
 * Add rude word
 *
 * @param {string} rude Rude word
 */
SettingsManager.prototype.addRude = function(rude) {
  this.blacklist.push(rude)
  this.changed = true
}




/**
 * Check if given IP address is in ban list
 *
 * @param {string} address
 */
SettingsManager.prototype.isBanned = function(address) {
  return ~this.bannedIPs.indexOf(address)
}




/**
 * Remove domain from allowed domains list
 *
 * @param {number} idx
 */
SettingsManager.prototype.removeAllowed = function(idx) {
  this.allowedDomains.splice(idx, 1)
  this.changed = true
}




/**
 * Remove domain from allowed URL domains list
 *
 * @param {number} idx
 */
SettingsManager.prototype.removeDomain = function(idx) {
  this.allowedURLDomains.splice(idx, 1)
  this.changed = true
}




/**
 * Remove IP from ban list
 *
 * @param {number} idx
 */
SettingsManager.prototype.removeIP = function(idx) {
  this.bannedIPs.splice(idx, 1)
  this.changed = true
}




/**
 * Remove rude word
 *
 * @param {number} idx
 */
SettingsManager.prototype.removeRude = function(idx) {
  this.blacklist.splice(idx, 1)
  this.changed = true
}




/**
 * Reset chat history, list of users, etc.
 */
SettingsManager.prototype.resetChat = function() {
  User.reset()
  this.users.resetHistory()
}




/**
 * Serialize
 */
SettingsManager.prototype.serialize = function() {
  var out = {}
    , keys = [
      'port', 'admin', 'allowedDomains', 'blacklist', 'bannedIPs', 'chatWidth',
      'chatHeight', 'allowedURLDomains', 'bitlyLogin', 'bitlyKey',
      'coolDownTimeout', 'maxMessagesPerMin', 'privateMessagesCount',
      'savedMessagesCount', 'hidden', 'chatDisabled', 'privateChatDisabled',
      'silentUserEnterLeave', 'chatPageURL'
    ]
  keys.forEach(function(key) {
    out[key] = this[key]
  }, this)

  out.users = []
  for (var name in this.users.users) {
    if (this.users.users.hasOwnProperty(name)) {
      out.users.push({
        name: name,
        ip:   this.users.users[name].ip
      })
    }
  }

  return out
}




/**
 * Update some settings
 */
SettingsManager.prototype.updateSettings = function(key, value) {
  this[key] = value
  this.changed = true
  if (this.userSettings().hasOwnProperty(key)) {
    this.emit('user settings update')
  }
}




/**
 * User settings
 */
SettingsManager.prototype.userSettings = function() {
  return {
    'chatWidth':           this.chatWidth,
    'chatHeight':          this.chatHeight,
    'coolDownTimeout':     this.coolDownTimeout,
    'hidden':              this.hidden,
    'chatDisabled':        this.chatDisabled,
    'privateChatDisabled': this.privateChatDisabled,
    'chatPageURL':         this.chatPageURL
  }
}

/**
 * Validate referer header - check if domain is allowed to run chat
 *
 */
SettingsManager.prototype.validateReferer = function(req, res, next) {
  var ref = req.get('referer')
    , parsed

  if (!ref) return res.send(403, '<h1>Not allowed</h1>')

  parsed = urlParse(ref)
  if (!~this.allowedDomains.indexOf(parsed.host)) {
    console.error('%s is not allowed to run chat', parsed.host)

    return res.send(403, '<h1>Not allowed</h1>')
  }

  next()
}


module.exports = new SettingsManager(config)