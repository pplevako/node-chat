require.config({
  'baseUrl':        'js/',
  'mainConfigFile': 'main.js',
  'optimize':       'uglify',
  'out':            '../chat.min.js',
  'paths':          {
    'angular':          '../lib/angular/angular.min',
    'angular-sanitize': '../lib/angular/angular-sanitize.min',
    'bootstrap':        '../lib/bootstrap/bootstrap.min',
    'css-emoticons':    '../lib/css-emoticons/jquery.cssemoticons.min',
    'jquery':           '../lib/jquery/jquery.min',
    'io':               '../lib/socket.io/socket.io'
  },
  'shim':           {
    'angular':          {'deps': ['jquery'], 'exports': 'angular'},
    'angular-sanitize': {'deps': ['angular']},
    'bootstrap':        {'deps': ['jquery']},
    'css-emoticons':    {'deps': ['jquery']}
  },
  'uglify':         {
    'no_mangle': true
  }
});

require([
  'config',
  'jquery',
  'app',
  'template',
  'templatePrivate'
], function(config, $, App, template, templatePrivate) {
  var $root = $(config.chatRootSelector)
  $root.addClass('chat-app')
  if ($root.hasClass('chat-app-private')) {
    config.privateMode = true

    $root.html(templatePrivate)
  } else {
    $root.html(template)
  }

  App.initialize();
});