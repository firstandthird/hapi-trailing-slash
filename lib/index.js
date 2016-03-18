var _ = require('lodash');

module.exports = function(server, options, allDone) {

  var logRedirect = function(from, to) {
    if (options.router.reportTrailingSlashRedirects){
      var string = "hapi-trailing-slash redirecting from " + from + " to " + to;
      server.log(string);     
    }
  };

  if (options.router.redirectTrailingSlash === 'ignore') {
    server.ext('onRequest', function (request, reply) {
      // try to match the route with the path as-is:
      var pre = server.match(request.method, request.path);
      if (pre) {
        return reply.continue();
      }
      // if there is no match, see if adding/removing a trailing slash fixes it:
      if (request.path[request.path.length-1] === '/') {
        var modifiedPath = request.path.replace(/\/$/, '');
      } else {
        var modifiedPath = request.path + '/';
      }
      var post = server.match(request.method, modifiedPath);
      if (post) {
        logRedirect(request.path, modifiedPath);
        return reply.redirect(post.path);
      }
      // if still no match just roll with it baby:
      reply.continue();
    });
  } else if (options.router.redirectTrailingSlash === 'append') {
    server.ext('onRequest', function (request, reply) {
      if (request.path[request.path.length-1] !== '/') {
        const slashedPath = request.path + '/';
        logRedirect(request.path, slashedPath);
        return reply.redirect(slashedPath);
      }
      return reply.continue();
    });
  } else if (options.router.redirectTrailingSlash === 'remove') {
    server.ext('onRequest', function (request, reply) {
      if (request.path[request.path.length-1] === '/') {
        const slashlessPath = request.path.replace(/\/$/, '');
        logRedirect(request.path, slashlessPath);
        return reply.redirect(slashlessPath);
      }
      return reply.continue();
    });
  }
  allDone();
};

module.exports.attributes = {
  name: 'hapi-trailing-slash',
  pkg: require('../package.json')
};
