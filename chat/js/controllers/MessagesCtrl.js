'use strict'

define([
  'config',
  'jquery',
  'utils',
  'css-emoticons'
], function(config, $, utils) {
  function MessagesCtrl($scope, $rootScope, $io) {
    /** Scope variables */
    $scope.chats = [
      {
        name: config.mainChatLabel,
        messages: []
      }
    ]

    $rootScope.current = $scope.chats[0]

    this.addScopeMethods($scope, $rootScope)
    this.registerScopeListeners($scope, $rootScope)
    this.registerIOListeners($scope, $io)

  }




  MessagesCtrl.prototype.addScopeMethods = function($scope, $rootScope) {
    /**
     * Add message to chat
     *
     * @param chat
     * @param message
     */
    $scope.addMessage = function(chat, message) {
      var length = chat.messages.push(message)
        , idx = $scope.getChatIndex(chat.name)

      $scope.markHasNew(chat)

      setTimeout(function() {
        var messages = $(config.messagesSelector).children()[idx]
          , message = $(messages).children()[length-1]

        $(message).emoticonize({
          animate: true
        })
      }, 300)
    }

    /**
     * Check if message should be added to opened private chat
     *
     * @param {Object} message
     */
    $scope.addToPrivate = function(message) {
      var chat
        , name = message.from

      if (!~['dead-user', 'rename'].indexOf(message.type)) {
        return
      }

      // thus $scope.$on('rename', fn) acts first
      // we take newName instead of old one
      if (message.type === 'rename') {
        name = message.extra.newName
      }

      if (chat = $scope.getChat(name)) {
        $scope.addMessage(chat, message)
      }
    }

    /**
     * Close chat, e.g. remove it
     *
     * @param {Object} chat Chat Object
     */
    $scope.close = function(chat) {
      var idx = $scope.chats.indexOf(chat)
      $scope.chats.splice(idx, 1)

      // go back to main
      $scope.setCurrent($scope.getChat(config.mainChatLabel))
    }

    /**
     * Get chat by name
     *
     * @param {string} name
     * @returns {Object}
     */
    $scope.getChat = function(name) {
      var idx = this.getChatIndex(name)
      if (idx === -1) return null

      return $scope.chats[idx]
    }

    /**
     * Get chat index by name
     *
     * @param {string} name
     * @returns {number}
     */
    $scope.getChatIndex = function(name) {
      var i = 0
        , chat

      while (chat = $scope.chats[i]) {
        if (chat.name === name) {
          return i
        }

        i++
      }

      return -1
    }

    /**
     * Message type to class
     *
     * @param {string} type Message type
     * @returns {string} Bootstrap CSS text-* class
     */
    $scope.messageClass = function(type) {
      if (!type) return null

      var map = {
        'rename': 'text-info',
        'new-user': 'text-success',
        'dead-user': 'text-success'
      }

      return map[type]
    }

    /**
     * Mark given chat with 'hasNew' flag if it's not opened
     *
     * @param {Object} chat
     */
    $scope.markHasNew = function(chat) {
      if ($rootScope.current !== chat) {
        chat.hasNew = true
      }
    }

    /**
     * Generate message string
     *
     * @param {Object} msg
     */
    $scope.messageString = function(msg) {
      var str = ''
      if (!msg.type) {
        str += msg.from + ': '
      }

      str += msg.text
      return str
    }

    /**
     * Scroll current chat to bottom
     */
    $scope.scrollCurrent = function() {
      var chat = $(config.currentChatSelector)
        , messagesBox = $(config.messagesSelector)

      setTimeout(function() {
        messagesBox.scrollTop(chat[0].scrollHeight - messagesBox.height());
      }, 300)
    }

    /**
     * Set given chat as current
     *
     * @param {Object} chat Chat object
     */
    $scope.setCurrent = function(chat) {
      $rootScope.current = chat

      if (chat.hasNew) {
        chat.hasNew = false
      }

      $scope.scrollCurrent()
    }

    /**
     * Start private chat with other user
     *
     * @param {string} from User name
     * @param {string} [message] Message
     */
    $scope.startPrivate = function(from, message) {
      var chat = {
        name: from,
        messages: []
      }

      $scope.chats.push(chat)
      $scope.setCurrent(chat)

      if (message) {
        $scope.addMessage(chat, message)
      }
    }
  }




  MessagesCtrl.prototype.registerScopeListeners = function($scope, $rootScope) {
    $scope.$on('start private', function(event, name) {
      var chat = $scope.getChat(name)
      if (chat) {
        $scope.setCurrent(chat)
      } else {
        $scope.startPrivate(name)
      }
    })

    $scope.$on('private message sent', function(event, message, to) {
      var data = [null, $rootScope.me.name, message, Date.now()]
        , msgObject = utils.toMessageObject(data)
        , chat = $scope.getChat(to)

      $scope.addMessage(chat, msgObject)
    })

    $scope.$on('rename', function(event, data) {
      var chat = $scope.getChat(data.oldName)
      if (chat) {
        chat.name = data.newName
      }
    })
  }




  MessagesCtrl.prototype.registerIOListeners = function($scope, $io) {
    /** Global chat history received */
    $io.on('history', function(history) {
      var mainChat = $scope.getChat(config.mainChatLabel)
        , data

      while (data = history.shift()) {
        $scope.addMessage(mainChat, utils.toMessageObject(data))
      }

      $scope.scrollCurrent()
    })

    /** When message is posted to global chat */
    $io.on('message', function(data) {
      var mainChat = $scope.getChat(config.mainChatLabel)
        , message = utils.toMessageObject(data)

      $scope.addMessage(mainChat, message)
      $scope.addToPrivate(message)
      $scope.scrollCurrent()
    })

    /** Private message received */
    $io.on('private message', function(from, message) {
      var chat = $scope.getChat(from)
        , msgObject = utils.toMessageObject([null, from, message, Date.now()])

      if (chat) {
        $scope.addMessage(chat, message)
      } else {
        $scope.startPrivate(from, msgObject)
      }

      $scope.scrollCurrent()
    })
  }

  return MessagesCtrl
})
