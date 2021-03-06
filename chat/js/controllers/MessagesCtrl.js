'use strict'

define([
  'config',
  'jquery',
  'utils',
  'css-emoticons'
], function(config, $, utils) {
  function prettyTime(ts) {
    var date = new Date(ts)
      , minutes = date.getMinutes()
      , seconds = date.getSeconds()

    var str = ''
    if (!minutes) {
      str += '00'
    } else if (minutes < 10) {
      str += '0' + minutes
    } else {
      str += minutes
    }

    str += ':'

    if (!seconds) {
      str += '00'
    } else if (seconds < 10) {
      str += '0' + seconds
    } else {
      str += seconds
    }

    return str
  }



  function MessagesCtrl($scope, $rootScope, $io) {
    /** Scope variables */
    $scope.chats = [
      {
        visible:  true,
        name:     config.mainChatLabel,
        messages: []
      }
    ]

    $rootScope.current = $scope.chats[0]

    this.addScopeMethods($scope, $rootScope, $io)
    this.registerScopeListeners($scope)
    this.registerIOListeners($scope, $rootScope, $io)
  }




  MessagesCtrl.prototype.addScopeMethods = function($scope, $rootScope, $io) {
    /**
     * Add message to chat
     *
     * @param chat
     * @param message
     */
    $scope.addMessage = function(chat, message) {
      var self = this
        , length = chat.messages.push(message)
        , idx = $scope.getChatIndex(chat.name)

      $scope.markHasNew(chat)

      setTimeout(function() {
        var messages = $(config.messagesSelector).children()[idx]
          , message

        // private mode
        if ($(messages).find('.panel-body').length) {
          message = $(messages).find('.panel-body').children().last()[0]
        } else {
          message = $(messages).children()[length - 1]
        }

        $(message).find('span.message').emoticonize({
          animate: true
        })

        self.scrollChat(messages)
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
      } else if (message.extra && message.extra.silent) {
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
     * Chat height
     */
    $scope.chatStyle = function(chat) {
      if (chat.visible) return {height: '363px'}

      return {
        bottom: 0,
        height: '38px',
        position: 'absolute',
        width: '100%'
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

      // make server clear private history
      $io.emit('clear private', chat.name)
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
     * Message type to class
     *
     * @param {string} type Message type
     * @returns {string} Bootstrap CSS text-* class
     */
    $scope.messageClass = function(type) {
      if (!type) return null

      var map = {
        'rename':    'system',
        'new-user':  'system',
        'dead-user': 'system'
      }

      return map[type]
    }

    /**
     * Generate message string
     *
     * @param {Object} msg
     * @param {boolean} compact
     */
    $scope.messageString = function(msg, compact) {
      var str = []

      str.push('<span class="time">', prettyTime(msg.date), '</span>')
      str.push('&nbsp;')
      if (msg.type) {
        str.push('<span class="', $scope.messageClass(msg.type), '">', msg.text, '</span>')
      } else {
        str.push('<span class="user">', (compact ? '' : '&gt;'), msg.from, '</span>')
        str.push(':&nbsp;')
        str.push('<span class="message">', msg.text, '</span>')
      }

      return str.join('')
    }

    /**
     * Scroll current chat to bottom
     *
     * @param {Element} messagesElement
     */
    $scope.scrollChat = function(messagesElement) {
      var chat = $(messagesElement)
        , messagesBox = $(config.messagesSelector)

      if ($(chat).find('.panel-body').length) {
        chat = $(chat).find('.panel-body')
        chat.scrollTop(chat[0].scrollHeight - chat.height())
      } else {
        messagesBox.scrollTop(chat[0].scrollHeight - messagesBox.height());
      }
    }

    /**
     * Set given chat as current
     *
     * @param {Object} chat Chat object
     */
    $scope.setCurrent = function(chat) {
      var self = this
      $rootScope.current = chat

      if (chat.hasNew) {
        chat.hasNew = false
      }

      setTimeout(function() {
        var idx = $scope.getChatIndex(chat.name)
        self.scrollChat($(config.messagesSelector).children()[idx])
      }, 50)

    }

    /**
     * Start private chat with other user
     *
     * @param {string} from User name
     * @param {string} [message] Message
     */
    $scope.startPrivate = function(from, message) {
      var chat = {
        visible:  true,
        name:     from,
        messages: []
      }

      $scope.chats.push(chat)
      $scope.setCurrent(chat)

      if (message) {
        $scope.addMessage(chat, message)
      }

      return chat
    }

    /**
     * Toggle chat visibility
     */
    $scope.toggleChat = function(chat) {
      chat.visible = !chat.visible
    }
  }




  MessagesCtrl.prototype.registerScopeListeners = function($scope) {
    $scope.$on('rename', function(event, data) {
      var chat = $scope.getChat(data.oldName)
      if (chat) {
        chat.name = data.newName
      }
    })

    $scope.$on('start private', function(event, name) {
      var chat = $scope.getChat(name)
      if (chat) {
        $scope.setCurrent(chat)
      } else {
        $scope.startPrivate(name)
      }
    })
  }




  MessagesCtrl.prototype.registerIOListeners = function($scope, $rootScope, $io) {
    $io.on('clear private', function(username) {
      var chat = $scope.getChat(username)
      if (!chat || config.privateMode !== true) return

      $scope.close(chat)
    })

    /** Global chat history received */
    $io.on('history', function(history) {
      var mainChat = $scope.getChat(config.mainChatLabel)
        , data

      // clear history first
      mainChat.messages = []
      $scope.chats.splice(1)

      while (data = history.shift()) {
        if (data[0] === 'private') {
          data[0] = null

          var name = data.pop()
            , chat = $scope.getChat(name)
            , msgObject = utils.toMessageObject(data)

          if (chat) {
            $scope.addMessage(chat, msgObject)
          } else {
            $scope.startPrivate(name, msgObject)
          }

          continue
        }

        $scope.addMessage(mainChat, utils.toMessageObject(data))
      }
    })

    /** When message is posted to global chat */
    $io.on('message', function(data) {
      var mainChat = $scope.getChat(config.mainChatLabel)
        , message = utils.toMessageObject(data)

      $scope.addToPrivate(message)

      if (message.extra && message.extra.silent) return
      $scope.addMessage(mainChat, message)
    })

    /** Private message received */
    $io.on('private message', function(from, message) {
      var chat = $scope.getChat(from)
        , msgObject = utils.toMessageObject([null, from, message, Date.now()])

      if (chat) {
        $scope.addMessage(chat, msgObject)
        chat.visible = true
      } else {
        $scope.startPrivate(from, msgObject)
      }
    })

    /** Private message sent by this user (message back) */
    $io.on('private message sent', function(message, to) {
      var data = [null, $rootScope.me.name, message, Date.now()]
        , msgObject = utils.toMessageObject(data)
        , chat = $scope.getChat(to)

      if (chat) {
        $scope.addMessage(chat, msgObject)
      } else {
        // private mode
        // $scope.startPrivate(to, msgObject)
      }
    })
  }

  return MessagesCtrl
})
