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
        method: 'POST',
        path: '/has/slash/{band}/',
        handler: function(request, reply) {
          if (request.params.band === 'gnr') {
            reply('sweet child of mine ');
          } else if (request.params.band === 'velvet_revolver') {
            reply('slither');
          } else {
            reply('not found');
          }
        }
      }
    ]);

    server.register({
      register: module,
      options: {
        method: 'append',
        verbose: true
      }
    }, function(err) {
      server.start(done);
    });
  });

  lab.afterEach(function(done){
    server.stop(done);
  });

  lab.test(' "append"  /has/slash/ works normally', function(done){
    server.inject({
      method: 'get',
      url: '/has/slash/'
    }, function(result) {
      Code.expect(result.statusCode).to.equal(200);
      Code.expect(result.payload).to.equal('slither');
      done();
    });
  });
  lab.test(' "append" /has/slash redirects to /has/slash/', function(done){
    server.inject({
      method: 'get',
      url: '/has/slash'
    }, function(result) {
      Code.expect(result.statusCode).to.equal(302);
      Code.expect(result.headers.location).to.equal('/has/slash/');
      done();
    });
  });
  lab.test(' "append"  /has/slash/ POST works with url params', function(done){
    server.inject({
      method: 'post',
      url: '/has/slash/velvet_revolver/'
    }, function(result) {
      Code.expect(result.statusCode).to.equal(200);
      Code.expect(result.payload).to.equal('slither');
      done();
    });
  });

  lab.test(' "append" /has/slash POST redirects with url params ', function(done){
    server.inject({
      method: 'post',
      url: '/has/slash/velvet_revolver'
    }, function(result) {
      Code.expect(result.statusCode).to.equal(302);
      Code.expect(result.headers.location).to.equal('/has/slash/velvet_revolver/');
      done();
    });
  });
});
