var _ = require('lodash');

module.exports = function(server, options, allDone) {

  if (options.router.redirectTrailingSlash === 'ignore'){
    server.ext('onRequest', function (request, reply) {
      var pre = server.match(request.method, request.path);
      console.log(pre);
      request.path = request.path.replace(/\/$/, '');
      var post = server.match(request.method, request.path);
      console.log(' post ' );
      console.log(post);
      reply();
    });
  } else if (options.router.redirectTrailingSlash === 'append'){

  } else if (options.router.redirectTrailingSlash === 'remove'){
    server.ext('onRequest', function (request, reply) {
      const slashlessPath = request.path.replace(/\/$/, '');
      var post = server.match(request.method, slashlessPath);
      if (post){
        console.log("redirect")
        return reply.redirect(post.path);
      }
      reply();
    });
  }
  // _.defaults(options, defaults);
  // else (options.append) {
  //   // server.ext('onRequest', function (request, next) {
  //   //   request.path = request.path.replace(/\/$/, '');
  //   //   next();
  //   // });
  // } else (options.remove) {
  //   // server.ext('onRequest', function (request, next) {
  //   //   request.path = request.path.replace(/\/$/, '');
  //   //   next();
  //   // });
  // }
  allDone();
};

module.exports.attributes = {
  name: 'hapi-trailing-slash',
  pkg: require('../package.json')
};
