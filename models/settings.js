'use strict'

var config = require('../config')
  , EventEmitter = require('events').EventEmitter
  , fs = require('fs')
  , path = require('path')
  , q = require('q')
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
  }, 5000)
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
 * Serialize
 */
SettingsManager.prototype.serialize = function() {
  var out = {}

  var keys = [
    'port', 'allowedDomains', 'blacklist', 'bannedIPs', 'chatWidth',
    'chatHeight', 'allowedURLDomains', 'bitlyLogin', 'bitlyKey',
    'coolDownTimeout', 'maxMessagesPerMin', 'savedMessagesCount'
  ]
  keys.forEach(function(key) {
    out[key] = this[key]
  }, this)

  out.users = []
  for (var name in this.users.users) {
    if (this.users.users.hasOwnProperty(name)) {
      out.users.push({
        name: name,
        ip: this.users.users[name].ip
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