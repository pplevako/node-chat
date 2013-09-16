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
  app.use(express.favicon())
  app.use(express.logger('dev'))
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(express.cookieParser('your secret here'))
  app.use(express.session())
  app.use(app.router)

  app.use('/chat', express.static(path.join(__dirname, 'chat')))
  app.use('/admin', express.static(path.join(__dirname, 'admin')))
})

app.configure('development', function() {
  app.use(express.errorHandler())
})



require('./routes/http')(app)
require('./routes/chat')(io.of('/chat'))
require('./routes/settings')(io.of('/dude'))

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'))
})
