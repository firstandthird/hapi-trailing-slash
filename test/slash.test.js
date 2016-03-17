var Code = require('code');   // assertion library
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Hapi = require('hapi');
var module = require("../index.js");

lab.experiment('hapi-trailing-slash', function() {
  var server;

  lab.beforeEach(function(done) {
    server = new Hapi.Server();
    server.connection({
      router: {
      }
    });

    server.route([
      {
        method: 'GET',
        path: '/it/works',
        handler: function(request, reply) {
          reply('redirects totally working');
        }
      },
      {
        method: 'GET',
        path: '/newtest',
        handler: function(request, reply) {
          reply('vhost redirects totally working ');
        }
      },
      {
        method: 'GET',
        path: '/newtest/{param*2}',
        handler: function(request, reply) {
          reply('redirects totally working and param passed was ' + request.params.param);
        }
      }
    ]);

    server.start(done);
  });

  lab.afterEach(function(done){
    server.stop(done);
  });
  /*
  ignore: It would ignore the trailing slash. It would either strip the trailing slash internally, or it would check for both /foo and /foo/ in routes.
  append: It would make a redirect to /foo/ if URL is /foo.
  remove: It would make a redirect to /foo if URL is /foo/.
  */
  lab.test(' "remove" redirects    /it/works/ -> /it/works', function(done){
    server.register({
      register: module,
      options: {
        router: {
          redirectTrailingSlash: 'remove'
        }
      }
    },
    function(err){
      server.start(function() {
        server.inject({
          method: 'get',
          url: '/it/works/'
        }, function(result) {
          Code.expect(result.statusCode).to.equal(302);
          Code.expect(result.headers.location).to.equal('/it/works');
          done();
        });
      });
    });
  });

  lab.test(' "remove" redirects /it/works -> /it/works', function(done){
    server.register({
      register: module,
      options: {
        router: {
          redirectTrailingSlash: 'remove'
        }
      }
    },
    function(err){
      server.start(function() {
        server.inject({
          method: 'get',
          url: '/it/works'
        }, function(result) {
          Code.expect(result.statusCode).to.equal(200);
          Code.expect(result.headers.location).to.equal('/it/works');
          done();
        });
      });
    });
});
