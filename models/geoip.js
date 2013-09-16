'use strict'

var geoip = require('geoip-lite')


exports.applyTo = function(obj, address) {
  var lookup = geoip.lookup(address.ip)
  if (!lookup) {
    return false
  }

  obj.country = lookup.country
  obj.state = lookup.region
  obj.city = lookup.city

  return true
}