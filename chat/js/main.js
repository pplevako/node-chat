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
  'app',
  'template'
], function(config, $, App, template) {
  $(config.chatRootSelector).addClass('chat-app')
  $(config.chatRootSelector).html(template)

  App.initialize();
});