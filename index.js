'use strict';
const useragent = require('useragent');
module.exports = (server, options, allDone) => {
  options = options || {};
  if (!options.method) {
    return allDone(new Error('hapi-trailing-slash plugin registered without specifiying which method to use'));
  }
  options.statusCode = options.statusCode || 301;

  const doRedirect = (path, request, reply) => {
    const redirectTo = request.url.search ? path + request.url.search : path;
    if (options.verbose) {
      server.log(['hapi-trailing-slash', 'redirect'], {
        remoteAddress: `${request.info.remoteAddress}:${request.info.remotePort}`,
        host: request.info.host,
        userAgent: useragent.parse(request.headers['user-agent']).toString(),
        referrer: request.info.referrer,
        from: request.path,
        to: redirectTo
      });
    }
    return reply.redirect(redirectTo).code(options.statusCode);
  };

  if (options.method === 'append') {
    server.ext('onRequest', (request, reply) => {
      const method = request.method.toLowerCase();
      if (['get', 'head'].indexOf(method) !== -1 && request.path[request.path.length - 1] !== '/') {
        const slashedPath = `${request.path}/`;
        return doRedirect(slashedPath, request, reply);
      }
      return reply.continue();
    });
  } else if (options.method === 'remove') {
    server.ext('onRequest', (request, reply) => {
      const method = request.method.toLowerCase();
      if (['get', 'head'].indexOf(method) !== -1 && request.path !== '/' && request.path[request.path.length - 1] === '/') {
        const slashlessPath = request.path.replace(/\/$/, '');
        return doRedirect(slashlessPath, request, reply);
      }
      return reply.continue();
    });
  }
  allDone();
};

module.exports.attributes = {
  name: 'hapi-trailing-slash',
  pkg: require('./package.json')
};
