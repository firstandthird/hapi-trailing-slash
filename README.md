# hapi-trailing-slash # [![Build Status](https://travis-ci.org/firstandthird/hapi-trailing-slash.svg?branch=master)](https://travis-ci.org/firstandthird/hapi-trailing-slash)

A [hapi](https://hapi.dev/) plugin that handles common trailing slash issues for incoming URLs,
so that _my-route_ and _my-route/_ will have consistent behaviors.

## Installation

```
npm install hapi-trailing-slash
```

## Basic Use

This plugin will register a preResponse extension that checks the path of all 404 Not Found results  before they are returned to the client. Depending on the behavior you've requested, it will either add or remove a trailing '/' to the request as needed and then return either a permanent or temporary [HTTP Redirect](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301) response containing the address of the new route.    

- __remove__ behavior:

  ```javascript
  const module = require("hapi-trailing-slash");
  await server.register({
    plugin: module,
    options: {
      method: 'remove'
    }
  });
  server.route({
    method: 'GET',
    path: '/test',
    handler: function (request, h) {
      return 'ok';
    }
  });
  ```

  Since this specifies the 'remove' behavior, if you try to GET _/test/_ (which contains an extra trailing slash and thus does not match the route path), hapi-trailing-slash will intercept the 404 before it is returned.  It will instead return an HTTP Redirect response with the Location header set to _/test_.  And you can still GET _/test_ directly and the plugin will not interfere.

- __append__ behavior:

  _append_ does the exact opposite of _remove_:

    ```javascript
    const module = require("hapi-trailing-slash");
    await server.register({
      plugin: module,
      options: {
        method: 'append'
      }
    });
    server.route({
      method: 'GET',
      path: '/test/',
      handler: function (request, h) {
        return 'ok';
      }
    });
    ```

    Now if you try to GET _/test_ (which does not match the route path), hapi-trailing-slash will intercept the call before the 404 Not Found error is returned to the client.  It then adds a trailing slash and instead returns an HTTP Redirect with the Location set to _/test/_.   But GET _/test/_ will still work as normal and you'll get the expected 'ok' response.


You must specify either 'append' or 'remove' when you register the plugin.  All other plugin options are optional.  

## Other Options

- __checkIfExists__

  By default hapi-trailing-slash will not check if your new route exists before automatically returning a redirect to it.  But if you set _checkIfExists_ to true, then the plugin will do a quick [HTTP HEAD](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/HEAD) check to see if the new route actually exists.  If it does not get a response, then it will go ahead and just return the original 404 Not Found result instead of a Redirect.

   _checkIfExists_ saves your clients from executing a request to a non-existent Location, instead it just tells them that the route does not exist.   

- __statusCode__

  By default hapi-trailing-slash returns all redirects with a [301 Moved Permanently](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301) status code.  But you can use this option to specify that you want it to instead use the [302 Found](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/302) status code (for temporary redirects) when you register the plugin.

- __verbose__

  Set this to _true_ to have hapi-trailing-slash post a server log of all redirects that it executes. This will include info like the user agent, browser, and from/to request paths.  Default is false.
