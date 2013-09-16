'use strict'

define([
  'controllers/ChangeNameCtrl',
  'controllers/MainCtrl',
  'controllers/MessageCtrl',
  'controllers/MessagesCtrl',
  'controllers/SmilesCtrl',
  'controllers/UsersCtrl'
], function(ChangeNameCtrl, MainCtrl, MessageCtrl, MessagesCtrl, SmilesCtrl, UsersCtrl) {
  return {
    ChangeNameCtrl: ChangeNameCtrl,
    MainCtrl:       MainCtrl,
    MessagesCtrl:   MessagesCtrl,
    MessageCtrl:    MessageCtrl,
    SmilesCtrl:     SmilesCtrl,
    UsersCtrl:      UsersCtrl
  }
})