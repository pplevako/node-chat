/**
 * Created with JetBrains WebStorm.
 * User: renpika
 * Date: 9/10/13
 * Time: 5:12 PM
 * To change this template use File | Settings | File Templates.
 */
'use strict'

var socket = io.connect()
var currentChat = ''
var users = {}

$(document).ready(function() {
    console.log("ready!")

    $('#chat-tabs').on('click', ' li a .close', function() {
        //var tabId = $(this).parents('li').children('a').attr('href');
        $(this).parents('li').remove('li');
        $('#chat-tabs a:first').tab('show');
    });

    Date.prototype.timeNow = function(){
        return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
    };

    function addMessage(chatId, userId, text) {
        var date = new Date()
        var newElement = $('<div></div>').text(
          '[' + date.timeNow() + '] ' +
          users[userId].name + ': '+ text)
        if (chatId == '') {
            $('#messages #general-chat').append(newElement)
        }
        else {
            if ($('#messages').children('#chat-' + chatId).length == 0) {
                addChat(chatId)
            }
            $('#messages').children('#chat-' + chatId).append(newElement)
        }
    }

    socket.on('remove user', function(data) {
        $('#user-list div[user-id="' + data.id + '"]').remove()
        removeUserById(data.id)
        //$('#messages').children('#chat-' + message.room).append(newElement)
        //$('#chat-tabs div[user-id="'+ data.id + '"]').remove()
    })

    socket.on('message', function(message) {
        addMessage(message.room, message.id, message.text)
    })

    socket.on('set name', function(data) {
        $('#guest-name').text(data.name)
    })

    $('#chat-tabs a').click(function(e) {
        // e.preventDefault();
        // $(this).tab('show');
        currentChat = ''
    })

    function addUser(user) {
        users[user.id] = user
        addUserEntry(user.id, user.name)
    }

    function removeUserById(id) {
        delete users[id]
    }

    socket.on('new user', function(user) {
        addUser(user)
    })

    function addUserEntry(id, name) {
        var newElement = $('<div></div>').text(name)
        newElement
          .attr('user-id', id)
          .attr('user-name', name)
        $('#user-list').append(newElement)
        newElement.click(userClick)
    }

    //rename
    function addChat(userId) {
        var id = 'chat-' + userId
        var newElement =
          $('<div></div>')
            .attr('id', id)
            .addClass('tab-pane')
        $('#messages').append(newElement)
        return id
    }

    function userClick() {
        var id = addChat($(this).attr('user-id'))
        //add tab
        var newElement = $('<li>').append(
          $('<a>')
            .attr('href', '#' + id)
            .attr('data-toggle', 'tab')
            .text($(this).attr('user-name'))
            .attr('user-id', $(this).attr('user-id'))
            .append($('<button></button>')
              .addClass('close')
              .attr('type', 'button')
              .text('×')
            )
        )
        newElement.children('a').click(function() {
            var id = $(this).attr('user-id')
            currentChat = id
        })
        $('#chat-tabs').append(newElement)
    }

    socket.on('users', function(users) {
        $('#user-list').empty();
        for (var user in users) {
            addUser(users[user])
        }
    })

    //this is called 'selector'
    $('#send-form').submit(function() {
        var text = $('#send-message').val()

        var message = {
            otherUser: currentChat,
            text: text
        }
        socket.emit('message', message)
        //alert('Handler for .submit() called.' + message)
        return false
    })

    $('#change-name-form').submit(function() {
        var name = $('#change-name').val()
        var message = {
            newName: name
        }
        socket.emit('change name', message)
        return false
    })

    socket.on('user changed name', function(data) {
        var newElement = $('<div></div>').text(
          '> ' + data.oldName + ' now known as ' + data.newName + '.' )
        $('#messages #general-chat').append(newElement)

        $('#user-list div[user-id="' + data.id + '"]').text(data.newName)

        users[data.id].name = data.newName
    })
})