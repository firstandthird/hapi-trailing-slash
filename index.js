'use strict';
const _ = require('lodash');


const ParamMatchingRegEx = new RegExp('(\\{)((?:[a-z][a-z0-9_]*))(\\*)(\\d+)(\\})', 'i');
const replaceRouteParamWithValues = (route, paramName, paramValue) => {
  // replace the most-common types of param:
  route = route.replace('{' + paramName + '}', paramValue)
  .replace('{' + paramName + '?}', paramValue)
  .replace('{' + paramName + '*}', paramValue);
  // match and replaces params of the form "{myParam*2}, {myParam*4}" as well:
  const matchedValue = _.first(ParamMatchingRegEx.exec(route));
  if (matchedValue) {
    return route.replace(matchedValue, paramValue);
  }
  return route;
};

module.exports = (server, options, allDone) => {
  if (!options.method) {
    throw new Error('hapi-trailing-slash plugin registered without specifiying which method to use');
  }
  const logRedirect = (from, to) => {
    if (options.verbose) {
      const string = `redirecting from ${from} to ${to}`;
      server.log(['hapi-trailing-slash', 'redirect'], string);
    }
  };

  const doInternalReroute = (path, originalRequest, originalReply) => {
    logRedirect(originalRequest.path, path);
    originalRequest.setUrl(path);
    originalReply.continue();
  };

  const doRedirect = (path, originalRequest, originalReply) => {
    let redirectTo = originalRequest.url.search ? path + originalRequest.url.search : path;
    _.each(originalRequest.params, (param, paramName) => {
      redirectTo = replaceRouteParamWithValues(redirectTo, paramName, param);
    });
    logRedirect(originalRequest.path, redirectTo);
    return originalReply.redirect(redirectTo);
  };

  if (options.method === 'smart') {
    server.ext('onRequest', (request, reply) => {
      // try to match the route with the path as-is:
      const pre = server.match(request.method, request.path);
      if (pre) {
        return reply.continue();
      }
      // if there is no match, see if adding/removing a trailing slash fixes it:
      let modifiedPath = '';
      if (request.path[request.path.length - 1] === '/') {
        modifiedPath = request.path.replace(/\/$/, '');
      } else {
        modifiedPath = request.path + '/';
      }
      const post = server.match(request.method, modifiedPath);
      if (post) {
        return doInternalReroute(modifiedPath, request, reply);
      }
      // if still no match just roll with it baby:
      reply.continue();
    });
  } else if (options.method === 'append') {
    server.ext('onRequest', (request, reply) => {
      if (request.path[request.path.length - 1] !== '/') {
        const slashedPath = request.path + '/';
        return doRedirect(slashedPath, request, reply);
      }
      return reply.continue();
    });
  } else if (options.method === 'remove') {
    server.ext('onRequest', (request, reply) => {
      if (request.path[request.path.length - 1] === '/') {
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
