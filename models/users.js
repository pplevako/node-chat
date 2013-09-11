/**
 * Created with JetBrains WebStorm.
 * User: renpika
 * Date: 9/10/13
 * Time: 8:34 PM
 * To change this template use File | Settings | File Templates.
 */

module.exports = Users

function Users() {
    this.users = {}
}

var guestNumber = 1
//var users = []

Users.prototype.create = function(id) {
    function assignGuestName() {
        return 'Guest_' + guestNumber++
    }
    return this.users[id] = new User(id, assignGuestName())
}

Users.prototype.getList = function() {

}

Users.prototype.getById = function(id) {
    return this.users[id]
}

Users.prototype.deleteById = function(id) {
    delete this.users[id]
}

function User(id, name) {
    this.id = id
    this.name = name
    this.rooms = []
    this.privateChatIds = {}
}

User.prototype.joinRoom = function(room) {
    this.rooms.push(room)
}

User.prototype.leaveRoom = function(room) {
    var index = this.rooms.indexOf(room)
    this.rooms.splice(index, 1)
}

//User.prototype.addId = function(id) {
//    this.privateChatIds.push(id)
//}
//
//User.prototype.removeId = function(id) {
//    var index = this.privateChatIds.indexOf(id)
//    this.privateChatIds.splice(index, 1)
//}

User.prototype.addRoom = function(id, room) {
    this.privateChatIds[id] = room
}

User.prototype.removeRoom = function(id) {
    delete this.privateChatIds[id]
}