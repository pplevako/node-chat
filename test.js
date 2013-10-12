var geoip = require('geoip-lite');
var ip = "85.137.75.185";
var geo = geoip.lookup(ip);
console.dir(geo);