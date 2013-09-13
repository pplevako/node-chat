'use strict'

var express = require('express')
  , path = require('path')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)

app.configure('all', function() {
    app.set('port', process.env.PORT || 3000)
    app.set('views', __dirname + '/views')
    app.set('view engine', 'jade')
    app.use(express.favicon())
    app.use(express.logger('dev'))
    app.use(express.bodyParser())
    app.use(express.methodOverride())
    app.use(express.cookieParser('your secret here'))
    app.use(express.session())
    app.use(app.router)
    app.use(express.static(path.join(__dirname, 'public')))
})

app.configure('development', function() {
    app.use(express.errorHandler())
})


app.get('/test', function(req, res) {
  res.render('test')
})


require('./routes/http')(app)
require('./routes/socket')(io.of('/chat'))

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'))
})
