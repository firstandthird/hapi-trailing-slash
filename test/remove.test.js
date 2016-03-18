'use strict';
const Code = require('code');   // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Hapi = require('hapi');
const theModule = require('../index.js');

lab.experiment('hapi-trailing-slash', function() {
  let server;

  lab.beforeEach((done) => {
    server = new Hapi.Server();
    server.connection();

    server.route([
      {
        method: 'GET',
        path: '/',
        handler: (request, reply) => {
          reply('root');
        }
      },
      {
        method: 'GET',
        path: '/no/slash',
        handler: (request, reply) => {
          reply('welcome to the jungle');
        }
      },
      {
        method: 'GET',
        path: '/no/slash/{band}',
        handler: (request, reply) => {
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
        handler: (request, reply) => {
          reply('slither');
        }
      },
      {
        method: 'GET',
        path: '/has/slash/{band}/',
        handler: (request, reply) => {
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
      register: theModule,
      options: {
        method: 'remove',
        verbose: true
      }
    }, function(err) {
      server.start(done);
    });
  });

  lab.afterEach((done) => {
    server.stop(done);
  });

  lab.test(' "remove" /no/slash works normally', (done) => {
    server.inject({
      method: 'get',
      url: '/no/slash'
    }, function(result) {
      Code.expect(result.statusCode).to.equal(200);
      Code.expect(result.payload).to.equal('welcome to the jungle');
      done();
    });
  });
  lab.test(' "remove" /no/slash/ redirects to /no/slash', (done) => {
    server.inject({
      method: 'get',
      url: '/no/slash/'
    }, function(result) {
      Code.expect(result.statusCode).to.equal(302);
      Code.expect(result.headers.location).to.equal('/no/slash');
      done();
    });
  });
  lab.test(' "remove" HEAD /no/slash/ redirects to /no/slash', (done) => {
    server.inject({
      method: 'head',
      url: '/no/slash/'
    }, function(result) {
      Code.expect(result.statusCode).to.equal(302);
      Code.expect(result.headers.location).to.equal('/no/slash');
      done();
    });
  });
  lab.test(' "remove" /no/slash GET works normally ', (done) => {
    server.inject({
      method: 'get',
      url: '/no/slash/velvet_revolver'
    }, function(result) {
      Code.expect(result.statusCode).to.equal(200);
      Code.expect(result.payload).to.equal('slither');
      done();
    });
  });

  lab.test(' "remove" /no/slash GET redirects with url params ', (done) => {
    server.inject({
      method: 'get',
      url: '/no/slash/velvet_revolver/?p1=hi'
    }, function(result) {
      Code.expect(result.statusCode).to.equal(302);
      Code.expect(result.headers.location).to.equal('/no/slash/velvet_revolver?p1=hi');
      done();
    });
  });
  lab.test(' "remove" /no/slash POST is ignored with url params ', (done) => {
    server.inject({
      method: 'post',
      url: '/no/slash/velvet_revolver/?p1=hi'
    }, function(result) {
      Code.expect(result.statusCode).to.equal(404);
      done();
    });
  });

  lab.test(' "remove" / (root path) is not stripped ', (done) => {
    server.inject({
      method: 'get',
      url: '/'
    }, function(result) {
      Code.expect(result.statusCode).to.equal(200);
      Code.expect(result.payload).to.equal('root');
      done();
    });
  });
});
