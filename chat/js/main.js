require.config({
  'baseUrl': 'js/',
  'mainConfigFile': 'main.js',
  'optimize': 'uglify',
  'out': '../chat.min.js',
  'paths':   {
    'angular':          '../lib/angular/angular.min',
    'angular-sanitize': '../lib/angular/angular-sanitize.min',
    'bootstrap':        '../lib/bootstrap/bootstrap.min',
    'css-emoticons':    '../lib/css-emoticons/jquery.cssemoticons.min',
    'jquery':           '../lib/jquery/jquery.min',
    'socket.io':        '../lib/socket.io/socket.io'
  },
  'shim':    {
    'angular':          {'deps': ['jquery'], 'exports': 'angular'},
    'angular-sanitize': {'deps': ['angular']},
    'bootstrap':        {'deps': ['jquery']},
    'css-emoticons':    {'deps': ['jquery']}
  },
  'uglify':  {
    'no_mangle': true
  }
});

require([
  'config',
  'jquery',
  'app'
], function(config, $, App) {
  $(config.chatRootSelector).addClass('chat-app')
  $(config.chatRootSelector).html('<div class="panel panel-default ng-cloak" ng-controller="MainCtrl" ng-style="{display: displayValue(), width: chatWidth + \'px\', height: chatHeight + \'px\'}"> <link media="screen" rel="stylesheet" type="text/css" ng-href="{{ baseUrl }}css/jquery.cssemoticons.css"/> <link media="screen" rel="stylesheet" type="text/css" ng-href="{{ baseUrl }}css/bootstrap.min.css"/> <link media="screen" rel="stylesheet" type="text/css" ng-href="{{ baseUrl }}css/chat.css"/> <!-- change name modal --> <div class="modal fade" id="changeName" tabindex="-1" role="dialog" aria-labelledby="changeNameLabel" aria-hidden="true" ng-controller="ChangeNameCtrl"> <div class="modal-dialog"> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> <h3 class="modal-title" id="changeNameLabel">Change name:</h3> </div> <div class="modal-body"> <form ng-submit="saveName()"> <input class="form-control" id="newName" type="text" ng-model="newName"/> <p class="text-danger">{{ error }}</p> </form> </div> <div class="modal-footer"> <button type="button" class="btn btn-primary" data-dismiss="modal" ng-click="saveName()"> Save </button> </div> </div> </div> </div> <div class="panel-body container"> <div class="row"> <div class="col-md-8"> <!-- messages list --> <div ng-controller="MessagesCtrl"> <ul class="nav nav-tabs"> <li ng-class="{active: (current == chat), bold: chat.hasNew}" ng-click="setCurrent(chat)" ng-repeat="chat in chats"> <a> {{ chat.name }} <i class="glyphicon glyphicon-remove" ng-click="close(chat)" ng-show="$index"></i> </a> </li> </ul> <div class="tab-content messages" ng-style="{height: chatHeight - 152.5 + \'px\'}"> <div class="tab-pane" ng-class="{active: (current == chat)}" ng-repeat="chat in chats"> <p ng-class="messageClass(msg.type)" ng-repeat="msg in chat.messages" ng-bind-html-unsafe="messageString(msg)"></p></div></div></div> <!-- message box --> <p class="cooldown text-danger"> <span ng-show="blocked">Cool down {{ blocked|interval }} minutes.</span> </p> <div class="message-box" ng-controller="MessageCtrl"> <form ng-submit="send()" class="input-group"> <span class="input-group-btn"> <a class="btn btn-default" ng-click="changeName()">>{{ me.name }}</a> </span> <input class="form-control" type="text" placeholder="Type message..." ng-disabled="disabled || blocked" ng-model="message"/> <span class="input-group-addon btn btn-smiles" ng-click="showSmiles()"><img ng-src="{{ baseUrl }}img/smile.png"/></span> <span class="input-group-btn"> <input class="btn btn-default" type="submit" value="Send"/> </span> </form> </div> </div> <div class="col-md-4 users" ng-controller="UsersCtrl"> <p>Users in chat: <strong>{{ users.length + 1 }}</strong></p> <ul ng-style="{height: (chatHeight - 70) + \'px\'}"> <li ng-show="user.name != me.name" ng-repeat="user in users | orderBy:[orderMeCountry, orderMeState, orderMeCity, \'country\', \'state\', \'city\']"> <a ng-click="startPrivate(user)">>{{ user.name }}</a> ({{ locationString(user) }}) </li> </ul> </div> <div class="clearfix"></div> <!-- smiles popover --> <div class="col-md-8 popover-smiles" ng-controller="SmilesCtrl" ng-show="show"> <div class="panel panel-default"> <div class="panel-body"></div> </div> </div> </div> </div> </div>')

  App.initialize();
});