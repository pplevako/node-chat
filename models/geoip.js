'use strict'

var geoip = require('geoip-lite')


exports.applyTo = function(obj, address) {
  var lookup = geoip.lookup(address.address)

  if (!lookup) {
    obj.country = address.address
    return false
  }

  obj.country = lookup.country
  obj.state = lookup.region
  obj.city = lookup.city

  return true
}