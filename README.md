# hapi-trailing-slash # [![Build Status](https://travis-ci.org/firstandthird/hapi-trailing-slash.svg?branch=master)](https://travis-ci.org/firstandthird/hapi-trailing-slash)

## Handles common trailing slash issues for incoming URLs ##

### register like so: ###

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

### options are: ###

* 'append' -- detects incoming requests that have no trailing slash, adds one, and redirects to the new url
* 'remove' -- detects incoming requests with a trailing slash, removes it, and redirects to the new url
