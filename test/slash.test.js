var Code = require('code');   // assertion library
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Hapi = require('hapi');
var module = require("../index.js");

lab.experiment('hapi-trailing-slash', function() {
  var server;

  lab.beforeEach(function(done) {
    server = new Hapi.Server();
    server.connection();

    server.route([
      {
        method: 'GET',
        path: '/no/slash',
        handler: function(request, reply) {
          reply('welcome to the jungle');
        }
      },
      {
        method: 'GET',
        path: '/has/slash/',
        handler: function(request, reply) {
          reply('slither');
        }
      },
      {
        method: 'GET',
        path: '/newtest/{param*2}',
        handler: function(request, reply) {
          reply('sweet child of mine ' + request.params.param);
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
  lab.test(' "append"  /has/slash/ works normally', function(done){
    server.register({
      register: module,
      options: {
        router: {
          redirectTrailingSlash: 'append'
        }
      }
    },
    function(err){
      server.start(function() {
        server.inject({
          method: 'get',
          url: '/has/slash/'
        }, function(result) {
          Code.expect(result.statusCode).to.equal(200);
          Code.expect(result.payload).to.equal('slither');
          done();
        });
      });
    });
  });
  lab.test(' "append" /has/slash redirects to /has/slash/', function(done){
    server.register({
      register: module,
      options: {
        router: {
          redirectTrailingSlash: 'append'
        }
      }
    },
    function(err){
      server.start(function() {
        server.inject({
          method: 'get',
          url: '/has/slash'
        }, function(result) {
          Code.expect(result.statusCode).to.equal(302);
          Code.expect(result.headers.location).to.equal('/has/slash/');
          done();
        });
      });
    });
  });
  lab.test(' "remove" /no/slash works normally', function(done){
    server.register({
      register: module,
      options: {
        router: {
          redirectTrailingSlash: 'remove'
        }
      }
    },
    function(err) {
      server.start(function() {
        server.inject({
          method: 'get',
          url: '/no/slash'
        }, function(result) {
          Code.expect(result.statusCode).to.equal(200);
          Code.expect(result.payload).to.equal('welcome to the jungle');
          done();
        });
      });
    });
  });
  lab.test(' "remove" /no/slash/ redirects to /no/slash', function(done){
    server.register({
      register: module,
      options: {
        router: {
          redirectTrailingSlash: 'remove'
        }
      }
    },
    function(err) {
      server.start(function() {
        server.inject({
          method: 'get',
          url: '/no/slash/'
        }, function(result) {
          Code.expect(result.statusCode).to.equal(302);
          Code.expect(result.headers.location).to.equal('/no/slash');
          done();
        });
      });
    });
  });
  // 'ignore'
  lab.test(' "ignore" /no/slash/ redirects to /no/slash', function(done){
    server.register({
      register: module,
      options: {
        router: {
          redirectTrailingSlash: 'ignore'
        }
      }
    },
    function(err) {
      server.start(function() {
        server.inject({
          method: 'get',
          url: '/no/slash/'
        }, function(result) {
          Code.expect(result.statusCode).to.equal(302);
          Code.expect(result.headers.location).to.equal('/no/slash');
          done();
        });
      });
    });
  });
  lab.test(' "ignore" /has/slash redirects to /has/slash/', function(done){
    server.register({
      register: module,
      options: {
        router: {
          redirectTrailingSlash: 'ignore'
        }
      }
    },
    function(err) {
      server.start(function() {
        server.inject({
          method: 'get',
          url: '/has/slash'
        }, function(result) {
          Code.expect(result.statusCode).to.equal(302);
          Code.expect(result.headers.location).to.equal('/has/slash/');
          done();
        });
      });
    });
  });

});
