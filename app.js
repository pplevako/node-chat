'use strict'

var config = require('./config')
  , express = require('express')
  , path = require('path')
  , app = express()
  , server = require('http').createServer(app)
  , settingsManager = require('./models/settings')
  , io = require('socket.io').listen(server)

app.configure('all', function() {
  app.set('port', process.env.PORT || config.port)
  app.set('views', __dirname + '/views')
  app.set('view engine', 'jade')
  app.use(express.logger('short '))
  app.use(express.methodOverride())

  /** Allowed domains filter */
  app.use('/chat.min.js', function(req, res, next) {
    settingsManager.validateReferer(req, res, next)
  })

  app.use(express.static(path.join(__dirname, 'chat')))

  app.use('/admin', express.basicAuth(config.admin.user, config.admin.password))
  app.use('/admin', express.static(path.join(__dirname, 'admin')))

  /** Router after static */
  app.use(app.router)
})

require('./routes/http')(app)
require('./routes/chat')(io.of('/chat'))
require('./routes/settings')(io.of('/dude'))

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'))
})