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

$(document).ready(function() {
    console.log( "ready!" )

    socket.on('remove user', function (data) {
        $('#user-list div[user-id="'+ data.id + '"]').remove()
        //$('#chat-tabs div[user-id="'+ data.id + '"]').remove()
    })

    socket.on('message', function (message) {
        var newElement = $('<div></div>').text(message.text + ' room: ' + message.room)
        if (message.room == '')
            $('#messages #general-chat').append(newElement)
        else
        {
            if ($('#messages').children('#chat-' + message.room).length == 0) {
                addChat(message.room)
            }
            $('#messages').children('#chat-' + message.room).append(newElement)

        }
    })

    socket.on('set name', function (data) {
        $('#guest-name').text(data.name)
    })

    $('#chat-tabs a').click(function (e) {
       // e.preventDefault();
       // $(this).tab('show');
        currentChat = ''
    })

    socket.on('new user', function(user) {
        addUser(user.id, user.name)
    })

    function addUser(id, name) {
        var newElement = $('<div></div>').text(name)
        newElement
          .attr('user-id', id)
          .attr('user-name', name)
        $('#user-list').append(newElement)
        newElement.click(userClick)
    }

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
            .attr('user-id', $(this).attr('user-id')))
        newElement.children('a').click(function() {
            var id = $(this).attr('user-id')
            currentChat = id
        })
        $('#chat-tabs').append(newElement)
    }
    socket.on('users', function(users) {
        $('#user-list').empty();
        for (var user in users) {
            addUser(users[user].id, users[user].name)
        }
        //move somewhere
        //$('#user-list div').click(userClick)
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
})