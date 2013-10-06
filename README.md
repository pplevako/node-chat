node-chat
=========

Web chat powered by Node.js and socket.io.


Installation
------------

Install all required Node.js modules and update GeoIP databases:

`npm install`


Server configuration
--------------------

For server-side you only need to set server port and admin credentials.
You can do it by setting `port` property in `config.json`:

```javascript
{
  // Chat application server will listen on this port
  "port": 1337,

  // When you access /admin, HTTP basic authentication will ask to login
  "admin": {
    "user": "admin",
    "password": "admin"
  },

  // ... other settings which can be managed from chat admin panel
}
```

Client configuration
--------------------

Client-side application comes minified, so you can call it following way:
```html
 <!-- your cool HTML goes here -->
 
 <script src="http://my-chat-app.myhost.com:1337/chat.min.js" type="application/javascript"></script>

 <!-- You choose ID of chat depending on settings in chat/js/config.js -->
 <div id="chat"></div>
 
 <!-- your cool HTML goes here again -->
```

In given example `chat.min.js` is minified version of chat application.
To build chat application you should edit `chat/js/config.js` first:

```javascript
{
    /**
     * Base URL is the URL of your chat application server.
     * You have to specify it because client-side app should
     * know where to get images and stylesheets. Make
     * sure you have trailing slash character.
     */
    baseUrl: 'http://my-chat-app.myhost.com:1337/',

    /**
     * This is CSS selector which is used by client
     * to get block where chat will be rendered. So
     * if you set it to '#my-cool-chat' you should
     * have empty <div id='my-cool-chat'></div>
     * somewhere on the page
     */
    chatRootSelector: '#chat'
}
```

Once you've edited this file you can build minified client application:

`npm run-script build-client`

Now you can start your app.

Private messages only mode
--------------------------

You can start client-side chat application in private messages only mode. To do
this you have to add class `chat-app-private` to chat container as follows:

```html
<div class="chat-app-private" id="chat"></div>
```

This mode means that guest will be logged into chat, but will be able to receive
& send private messages only. If someone sends him a message guest will see
pop-up block in right bottom corner of the screen.

Start
-----

Usually you start with following command:

`node app.js`

If you like to override HTTP port setting, just add `PORT` environment variable before `node`:

`PORT=8080 node app.js`


Development
-----------

### Debugging client application

To test the chat you can access it using `http://CHAT-HOST:PORT/`. This will load not minified version of chat client, so you can debug it.

### Minified client compilation

Minified app version is built by [r.js](https://github.com/jrburke/r.js/). Build configuration is located at `chat/js/main.js`. When you run `npm run-script build-client`, following commands are performed:

```bash 
node scripts/gen-template.js # same as 'npm run-script build-template'
cd chat/js
../../node_modules/.bin/r.js -o baseUrl=. name=../lib/require.js/almond include=main mainConfigFile=main.js
```

### Working with template

Layout template is located at `chat/index.html`. There is npm task `build-template` which creates `chat/js/template.js` from this file. To say it just minifies HTML and wraps result string into AMD module.

Also `npm run-script build-client` runs `build-template`, so minified client gets all the layout updates.

### CSS

All the CSS is located at `chat/css/`. If you see CSS is messed up on your external page where you run chat, you should edit chat CSS files somehow, so they only reflect elements which are under `.chat-app` (I did not found a way to insert .chat-app prefix to every CSS rule).

Administration panel
--------------------

Chat admin panel is located at `http://CHAT-APP-HOST:PORT/admin`.
