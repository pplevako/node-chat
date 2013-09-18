'use strict'

var fs = require('fs')
  , path = require('path')
  , util = require('util')
  , htmlPath = path.join(__dirname, '..', 'chat', 'index.html')
  , tplPath = path.join(__dirname, '..', 'chat', 'js', 'template.js')
  , html = fs.readFileSync(htmlPath).toString()

var tokens = html.split('\n')
  , token
  , tpl = ''
  , pattern = 'define([],function(){\n  return \'%s\'\n})'

while (tokens.length) {
  token = tokens.shift().trim()

  if (token) {
    tpl += token.replace(/'/g, '\\\'')
  }
}

fs.writeFileSync(tplPath, util.format(pattern, tpl))