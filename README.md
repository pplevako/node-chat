node-chat
=========

Web chat powered by Node.js and socket.io.


Installation
------------

Install all required Node.js modules and update GeoIP databases:

`npm install`


Server configuration
--------------------

For server-side you only need to set HTTP server port. You can do it by setting `port` property in `config.json`:

```javascript
{
  // Chat application server will listen on this port
  "port": 1337,

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

Start
-----

Usually you start with following command:

`node app.js`

If you like to override HTTP port setting, just add `PORT` environment variable before `node`:

`PORT=8080 node app.js`


Administration panel
--------------------

Chat admin panel is located at `http://CHAT-APP-HOST:PORT/admin/`.
