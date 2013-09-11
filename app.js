
/**
 * Module dependencies.
 */

var express = require('express')
var routes = require('./routes')
var http = require('http')
var path = require('path')
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io').listen(server)

// all environments
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


// development only
app.configure('development', function () {
    app.use(express.errorHandler())
})


app.get('/', routes.index)

// Socket.io Communication
require('./routes/socket')(io)

/**
 * Start Server
 */
server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'))
})
