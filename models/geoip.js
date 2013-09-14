'use strict'

var geoip = require('geoip-lite')
  , countries = require('country-data').countries


exports.applyTo = function(obj, address) {
  address.ip = '37.112.37.176' // TODO for testing only
  var lookup = geoip.lookup(address.ip)
  if (!lookup) {
    return false
  }

  obj.country = countries[lookup.country].name
  obj.city = lookup.city

  return true
}