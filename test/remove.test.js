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
            if (request.query.band === 'gnr') {
              reply('sweet child of mine ');
            } else if (request.query.band === 'velvet_revolver') {
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
          method: 'remove',
          verbose: true
        }
      }, function(err) {
        server.start(done);
      });
    });

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
          method: 'POST',
          path: '/no/slash/{band}',
          handler: function(request, reply) {
            if (request.params.band === 'gnr') {
              reply('sweet child of mine ');
            } else if (request.params.band === 'velvet_revolver') {
              reply('slither');
            } else {
              reply('not found');
            }
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
          method: 'remove',
          verbose: true
        }
      }, function(err) {
        server.start(done);
      });
    });

  lab.afterEach(function(done){
    server.stop(done);
  });

  lab.test(' "remove" /no/slash works normally', function(done){
    server.inject({
      method: 'get',
      url: '/no/slash'
    }, function(result) {
      Code.expect(result.statusCode).to.equal(200);
      Code.expect(result.payload).to.equal('welcome to the jungle');
      done();
    });

  });
  lab.test(' "remove" /no/slash/ redirects to /no/slash', function(done){
    server.inject({
      method: 'get',
      url: '/no/slash/'
    }, function(result) {
      Code.expect(result.statusCode).to.equal(302);
      Code.expect(result.headers.location).to.equal('/no/slash');
      done();
    });
  });
  lab.test(' "remove" /no/slash POST works normally ', function(done){
    server.inject({
      method: 'post',
      url: '/no/slash/velvet_revolver'
    }, function(result) {
      Code.expect(result.statusCode).to.equal(200);
      Code.expect(result.payload).to.equal('slither');
      done();
    });
  });

  lab.test(' "remove" /no/slash POST redirects with url params ', function(done){
    server.inject({
      method: 'post',
      url: '/no/slash/velvet_revolver/'
    }, function(result) {
      Code.expect(result.statusCode).to.equal(302);
      Code.expect(result.headers.location).to.equal('/no/slash/velvet_revolver');
      done();
    });
  });
});
