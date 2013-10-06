'use strict'

var config = require('./config')
  , express = require('express')
  , path = require('path')
  , SessionSockets = require('session.socket.io')
  , settingsManager = require('./models/settings')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , cookieParser = express.cookieParser('something')
  , sessionStore = new (express.session.MemoryStore)
  , sessionSockets = new SessionSockets(io, sessionStore, cookieParser)


app.configure('all', function() {
  app.set('port', process.env.PORT || config.port)
  app.set('views', __dirname + '/views')
  app.set('view engine', 'jade')
  app.use(cookieParser)
  app.use(express.session({secret: 'something', store: sessionStore}))
  app.use(express.logger('short'))
  app.use(express.methodOverride())

  /** Allowed domains filter */
  app.use('/chat.min.js', function(req, res, next) {
    settingsManager.validateReferer(req, res, next)
  })

  /** Static after routes */
  app.use(app.router)
  app.use(express.static(path.join(__dirname, 'chat')))

  app.use('/admin', express.basicAuth(config.admin.user, config.admin.password))
  app.use('/admin', express.static(path.join(__dirname, 'admin')))
})

require('./routes/http')(app)
require('./routes/chat')(sessionSockets.of('/chat'))
require('./routes/settings')(sessionSockets.of('/dude'))

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'))
})