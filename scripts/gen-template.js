'use strict'

var fs = require('fs')
  , jade = require('jade')
  , path = require('path')
  , util = require('util')
  , jsPath = path.join(__dirname, '..', 'chat', 'js', process.argv[3])
  , tplPath = path.join(__dirname, '..', 'chat', 'templates', process.argv[2])
  , tpl = fs.readFileSync(tplPath).toString()

var fn = jade.compile(tpl, {filename: tplPath, pretty: false})
  , html = fn({}).replace(/'/g, '\\\'')
  , pattern = 'define([],function(){\n  return \'%s\'\n})'

fs.writeFileSync(jsPath, util.format(pattern, html))