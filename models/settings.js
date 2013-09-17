'use strict'

var config = require('../config')
  , EventEmitter = require('events').EventEmitter
  , fs = require('fs')
  , path = require('path')
  , q = require('q')
  , shorturl = require('shorturl')
  , util = require('util')


function generateId() {
  return (Date.now() * Math.random()).toString(16).split('.')[0]
}




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

  this.usersCount = 0

  setInterval(function() {
    if (!self.changed) {
      return
    }

    self.changed = false
    var configPath = path.join(__dirname, '../config.json')
      , out = self.serialize()

    out.usersCount = 0
    fs.writeFile(configPath, JSON.stringify(out, null, ' '), function(err) {
      if (err) console.error(err)
    })
  }, 5000)
}
util.inherits(SettingsManager, EventEmitter)




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
 * Add url to list of url waiting to be enabled and return it's identifier
 *
 * @param {string} url URL address
 * @returns {string} HEX unique id
 */
SettingsManager.prototype.addPendingURL = function(url) {
  var pending = {
    url: url,
    id:  generateId()
  }

  this.pendingURLs.push(pending)
  this.changed = true

  this.emit('pending url', pending)
  return pending.id
}




/**
 * Mark given url
 *
 * @param {string} id HEX-id for URL
 */
SettingsManager.prototype.approvePendingURL = function(id) {
  var self = this
    , pending = null
    , el
    , i = 0

  while (el = this.pendingURLs[i++]) {
    if (el.id === id) {
      pending = el
      break
    }
  }

  if (!pending) return

  this.pendingURLs.splice(i - 1, 1)
  this.changed = true

  shorturl(pending.url, 'bit.ly', {
    login:  this.bitly.login,
    apiKey: this.bitly.key
  }, function(tinyURL) {
    self.emit('approved url', pending.id, tinyURL)
  })

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
 * Serialize
 */
SettingsManager.prototype.serialize = function() {
  var out = {}

  var keys = [
    'port', 'allowedDomains', 'blacklist', 'bannedIPs', 'chatWidth',
    'chatHeight', 'pendingURLs', 'allowedURLDomains', 'bitlyLogin', 'bitlyKey',
    'coolDownTimeout', 'maxMessagesPerMin', 'savedMessagesCount', 'usersCount'
  ]
  keys.forEach(function(key) {
    out[key] = this[key]
  }, this)

  return out
}




/**
 * Update some settings
 */
SettingsManager.prototype.updateSettings = function(key, value) {
  this[key] = value
  this.changed = true
}




/**
 * Update current online
 */
SettingsManager.prototype.usersCountUpdate = function(by) {
  this.usersCount += by
  this.emit('users count update', this.usersCount)
}




/**
 * User settings
 */
SettingsManager.prototype.userSettings = function() {
  return {
    'chatWidth': this.chatWidth,
    'chatHeight': this.chatHeight,
    'coolDownTimeout': this.coolDownTimeout
  }
}
module.exports = new SettingsManager(config)