'use strict'

define([
  'controllers/ChangeNameCtrl',
  'controllers/MainCtrl',
  'controllers/MessageCtrl',
  'controllers/MessagesCtrl',
  'controllers/UsersCtrl'
], function(ChangeNameCtrl, MainCtrl, MessageCtrl, MessagesCtrl, UsersCtrl) {
  return {
    ChangeNameCtrl: ChangeNameCtrl,
    MainCtrl:       MainCtrl,
    MessagesCtrl:   MessagesCtrl,
    MessageCtrl:    MessageCtrl,
    UsersCtrl:      UsersCtrl
  }
})