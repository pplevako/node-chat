require.config({
  'baseUrl': 'js/',
  'paths':   {
    'angular':          '../lib/angular/angular.min',
    'angular-sanitize': '../lib/angular/angular-sanitize.min',
    'bootstrap':        '../lib/bootstrap/bootstrap.min',
    'css-emoticons':    '../lib/css-emoticons/jquery.cssemoticons.min',
    'jquery':           '../lib/jquery/jquery.min',
    'socket.io':        '../lib/socket.io/socket.io',
  },
  'shim':    {
    'angular':          {'deps': ['jquery'], 'exports': 'angular'},
    'angular-sanitize': {'deps': ['angular']},
    'bootstrap':        {'deps': ['jquery']},
    'css-emoticons':    {'deps': ['jquery']}
  }
});

require([
  'app'
], function(App) {
  App.initialize();
});