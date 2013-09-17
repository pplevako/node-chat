'use strict'

var express = require('express')
  , app = express()
  , server = require('http').createServer(app)

app.configure('all', function() {
  app.set('port', 5000)
  app.set('views', __dirname + '/views')
  app.set('view engine', 'jade')

  app.get('/', function(req, res) {
    res.render('test')
  })
})

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'))
})