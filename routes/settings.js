'use strict'

var settingsManager = require('../models/settings')


module.exports = function(io) {
  settingsManager.on('pending url', function(pending) {
    io.emit('pending url', pending)
  })

  settingsManager.on('users count update', function(count) {
    io.emit('users count update', count)
  })

  io.on('connection', function(socket) {
    socket.emit('settings', settingsManager.serialize())

    socket.on('update', function(key, value) {
      settingsManager.updateSettings(key, value)
    })

    socket.on('approve url', function(idx) {
      settingsManager.approvePendingURL(idx)
    })

    socket.on('add domain', function(domain) {
      settingsManager.addDomain(domain)
    })

    socket.on('remove domain', function(idx) {
      settingsManager.removeDomain(idx)
    })

    socket.on('add ip', function(ip) {
      settingsManager.addIP(ip)
    })

    socket.on('remove ip', function(idx) {
      settingsManager.removeIP(idx)
    })

    socket.on('add rude', function(rude) {
      settingsManager.addRude(rude)
    })

    socket.on('remove rude', function(idx) {
      settingsManager.removeRude(idx)
    })
  })
}