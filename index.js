'use strict';
const useragent = require('useragent');
const wreck = require('wreck');

module.exports = (server, options, allDone) => {
  options = options || {};
  if (!options.method) {
    return allDone(new Error('hapi-trailing-slash plugin registered without specifiying which method to use'));
  }
  options.statusCode = options.statusCode || 301;

  const redirectExists = (redirectPath, callback) => {
    if (!options.checkIfExists) {
      return callback(true);
    }
    wreck.request('head', redirectPath, {}, (err, res) => {
      if (err) {
        return callback(false);
      }
      return callback(res.statusCode < 400);
    });
  };

  const doRedirect = (path, request, reply) => {
    const redirectTo = request.url.search ? path + request.url.search : path;
    if (options.verbose) {
      server.log(['hapi-trailing-slash', 'redirect'], {
        remoteAddress: `${request.info.remoteAddress}:${request.info.remotePort}`,
        host: request.info.host,
        userAgent: request.headers['user-agent'],
        browser: useragent.parse(request.headers['user-agent']).toString(),
        referrer: request.info.referrer,
        from: request.path,
        to: redirectTo
      });
    }
    return reply.redirect(redirectTo).code(options.statusCode);
  };

  // if (options.method === 'append') {
  server.ext('onPreResponse', (request, reply) => {
    const statusCode = request.response.output ? request.response.output.statusCode : request.response.statusCode;
    // if the route was already found by hapi then just ignore it:
    if (statusCode !== 404) {
      return reply.continue();
    }
    const method = request.method.toLowerCase();
    // pick a condition checker based on either 'append' or 'remove' mode:
    const condition = options.method === 'append' ? () => request.path[request.path.length - 1] !== '/' :
      () => request.path !== '/' && request.path[request.path.length - 1] === '/';
    // see if we need to do a redirect for either slashed/slashless path:
    if (['get', 'head'].indexOf(method) !== -1 && condition()) {
      if (request.path.indexOf('.') !== -1) {
        return reply.continue();
      }
      // pick a redirection based on either 'append' or 'remove' mode:
      const redirectPath = options.method === 'append' ? `${request.path}/` : request.path.replace(/\/$/, '');
      return redirectExists(redirectPath, (exists) => {
        if (exists) {
          doRedirect(redirectPath, request, reply);
        } else {
          return reply.continue();
        }
      });
    }
    // otherwise it really is a 404:
    return reply.continue();
  });
  allDone();
};

module.exports.attributes = {
  name: 'hapi-trailing-slash',
  pkg: require('./package.json')
};
