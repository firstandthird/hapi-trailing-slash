'use strict';

module.exports = (server, options, allDone) => {
  if (!options.method) {
    return allDone(new Error('hapi-trailing-slash plugin registered without specifiying which method to use'));
  }
  const logRedirect = (from, to) => {
    if (options.verbose) {
      server.log(['hapi-trailing-slash', 'redirect'], { from, to });
    }
  };

  const doRedirect = (path, originalRequest, originalReply) => {
    const redirectTo = originalRequest.url.search ? path + originalRequest.url.search : path;
    logRedirect(originalRequest.path, redirectTo);
    return originalReply.redirect(redirectTo);
  };

  if (options.method === 'append') {
    server.ext('onRequest', (request, reply) => {
      if (request.method.toLowerCase() === 'get' && request.path[request.path.length - 1] !== '/') {
        const slashedPath = request.path + '/';
        return doRedirect(slashedPath, request, reply);
      }
      return reply.continue();
    });
  } else if (options.method === 'remove') {
    server.ext('onRequest', (request, reply) => {
      if (request.method.toLowerCase() === 'get' && request.path[request.path.length - 1] === '/') {
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
