'use strict'

var geoip = require('geoip-lite')
  , countries = require('country-data')


exports.applyTo = function(obj, address) {
  var lookup = geoip.lookup(address)
  if (!lookup) {
    return false
  }

  obj.country = countries[lookup.country]
  obj.city = countries[lookup.city]
}