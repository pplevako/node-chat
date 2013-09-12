var
  Users = require('../models/users'),
  users = new Users()

var roomNumber = 0
var sockets = {}

module.exports = function(io) {

    io.sockets.on('connection', function(socket) {

        //replace socket.id with u.id everywhere
        sockets[socket.id] = socket

        var u = users.create(socket.id, socket)

        socket.emit('users', users.users)

        socket.broadcast.emit('new user', {
            name: u.name,
            id: u.id
        })

        socket.emit('set name', {
            name: u.name
        })

        socket.on('disconnect', function() {
            users.deleteById(u.id)
            socket.broadcast.emit('remove user', {
                id: u.id,
                name: u.name
            })
        })

        socket.on('change name', function(data) {
            var oldName = u.name
            u.name = data.newName
            socket.emit('set name', {
                name: u.name
            })
            io.sockets.emit('user changed name', {
                id: u.id,
                oldName: oldName,
                newName: u.name
            })
        })

        socket.on('message', function(data) {
            //TODO wordfilter
            if (data.otherUser != '') {
                if (typeof sockets[data.otherUser] == 'undefined')
                //LOLZ
                    return;
                sockets[data.otherUser].emit('message', {
                    text: data.text,
                    room: socket.id,
                    id: u.id
                })

                socket.emit('message', {
                    text: data.text,
                    room: data.otherUser,
                    id: u.id
                })
            }
            else {
                io.sockets.emit('message', {

                    text: data.text,
                    room: '',
                    id: u.id
                })
            }
        })
    })
}
