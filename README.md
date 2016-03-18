# hapi-trailing-slash #

## Handles common trailing slash issues for incoming URLs ##

###register like so:###

```javascript
var module = require("hapi-trailing-slash");
.
.
.
server.register({
  register: module,
  options: {
    method: 'remove',
    verbose: true
  }
});
```

###options are:###

* 'append' -- detects incoming requests that have no trailing slash, adds one, and redirects to the new url
* 'remove' -- detects incoming requests with a trailing slash, removes it, and redirects to the new url
* 'smart' -- detects incoming requests that don't match any route, and checks if adding or removing a trailing slash will cause it to match, will internally
          reroute the call if so
