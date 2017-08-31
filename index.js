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
        userAgent: request.headers['user-agent'],
        browser: useragent.parse(request.headers['user-agent']).toString(),
        referrer: request.info.referrer,
        from: request.path,
        to: redirectTo
      });
    }
    return reply.redirect(redirectTo).code(options.statusCode);
  };

  if (options.method === 'append') {
    server.ext('onPreResponse', (request, reply) => {
      const statusCode = request.response.output ? request.response.output.statusCode : request.response.statusCode;
      // if the route was already found by hapi then just ignore it:
      if (statusCode !== 404) {
        return reply.continue();
      }
      const method = request.method.toLowerCase();
      // before failing, first check if there's a slashed route we can redirect to:
      if (['get', 'head'].indexOf(method) !== -1 && request.path[request.path.length - 1] !== '/') {
        const slashedPath = `${request.path}/`;
        return doRedirect(slashedPath, request, reply);
      }
      // otherwise it really is a 404:
      return reply.continue();
    });
  } else if (options.method === 'remove') {
    server.ext('onPreResponse', (request, reply) => {
      const statusCode = request.response.output ? request.response.output.statusCode : request.response.statusCode;
      // if the route was already found by hapi then just ignore it:
      if (statusCode !== 404) {
        return reply.continue();
      }
      // before failing, check if there's an unslashed route we can redirect to:
      const method = request.method.toLowerCase();
      if (['get', 'head'].indexOf(method) !== -1 && request.path !== '/' && request.path[request.path.length - 1] === '/') {
        const slashlessPath = request.path.replace(/\/$/, '');
        return doRedirect(slashlessPath, request, reply);
      }
      // otherwise it really is a 404:
      return reply.continue();
    });
  }
  allDone();
};

module.exports.attributes = {
  name: 'hapi-trailing-slash',
  pkg: require('./package.json')
};
