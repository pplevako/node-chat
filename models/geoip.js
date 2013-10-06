'use strict'

var geoip = require('geoip-lite')


exports.applyTo = function(obj, address) {
  var lookup = geoip.lookup(address)

  if (!lookup) {
    obj.country = ''
    obj.state = ''
    obj.city = ''
    obj.ll = [0,0]
    return false
  }

  obj.country = lookup.country
  obj.state = lookup.region
  obj.city = lookup.city
  obj.ll = lookup.ll || [0, 0]

  return true
}