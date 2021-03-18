'use strict';
const useragent = require('useragent');
const wreck = require('@hapi/wreck');

const register = async (server, options) => {
  options = options || {};
  if (!options.method) {
    throw new Error('hapi-trailing-slash plugin registered without specifiying which method to use');
  }
  options.statusCode = options.statusCode || 301;

  const redirectExists = async (redirectPath) => {
    if (!options.checkIfExists) {
      return Promise.resolve(true);
    }
    try {
      const { res, payload } = await wreck.request('head', redirectPath);
      return Promise.resolve(res.statusCode < 400);
    } catch (e) {
      return Promise.resolve(false);
    }
  };

  const doRedirect = (path, request, h) => {
    const redirectTo = request.url.search ? path + request.url.search : path;
    if (options.verbose) {
      const packet = {
        remoteAddress: `${request.info.remoteAddress}:${request.info.remotePort}`,
        host: request.info.host,
        userAgent: request.headers['user-agent'],
        browser: useragent.parse(request.headers['user-agent']).toString(),
        from: request.path,
        to: redirectTo
      };
      if (request.info.referrer) {
        packet.referrer = request.info.referrer;
      }
      server.log(['hapi-trailing-slash', 'redirect'], packet);
    }
    const response = h.redirect(redirectTo)
    // redirects in hapi 17 are either permanent() or temporary()
    if (options.statusCode === 301) {
      return response.permanent();
    }
    else {
      return response.temporary();
    }
  };

  server.ext('onPreResponse', async(request, h) => {
    const statusCode = request.response.output ? request.response.output.statusCode : request.response.statusCode;
    // if the route was already found by hapi then just ignore it:
    if (statusCode !== 404) {
      return h.continue;
    }
    const method = request.method.toLowerCase();
    // pick a condition checker based on either 'append' or 'remove' mode:
    const condition = options.method === 'append' ? () => request.path[request.path.length - 1] !== '/' :
      () => request.path !== '/' && request.path[request.path.length - 1] === '/';
    // see if we need to do a redirect for either slashed/slashless path:
    if (['get', 'head'].indexOf(method) !== -1 && condition()) {
      if (request.path.indexOf('.') !== -1) {
        return h.continue;
      }
      // pick a redirection based on either 'append' or 'remove' mode:
      const redirectPath = options.method === 'append' ? `${request.path}/` : request.path.replace(/\/$/, '');
      const exists = await redirectExists(redirectPath);
      if (exists) {
        return doRedirect(redirectPath, request, h);
      } else {
        return h.continue;
      }
    }
    // otherwise it really is a 404:
    return h.continue;
  });
  return Promise.resolve();
};

exports.plugin = {
  register,
  once: true,
  pkg: require('./package.json')
};
