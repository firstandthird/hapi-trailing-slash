'use strict';
const Code = require('code');   // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Hapi = require('hapi');
const theModule = require('../index.js');
const async = require('async');

lab.experiment('hapi-trailing-slash', () => {
  let server;

  lab.beforeEach((done) => {
    server = new Hapi.Server();
    server.connection();

    server.route([
      {
        method: 'GET',
        path: '/no/slash',
        handler: (request, reply) => {
          reply('welcome to the jungle');
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
        method: 'append',
        verbose: true
      }
    }, (err) => {
      if (err) {
        throw err;
      }
      server.start(done);
    });
  });

  lab.afterEach((done) => {
    server.stop(done);
  });

  lab.test(' "append"  /has/slash/ works normally', (done) => {
    server.inject({
      method: 'get',
      url: '/has/slash/'
    }, (result) => {
      Code.expect(result.statusCode).to.equal(200);
      Code.expect(result.payload).to.equal('slither');
      done();
    });
  });
  lab.test(' "append" /has/slash redirects to /has/slash/', (done) => {
    server.inject({
      method: 'get',
      url: '/has/slash'
    }, (result) => {
      Code.expect(result.statusCode).to.equal(301);
      Code.expect(result.headers.location).to.equal('/has/slash/');
      done();
    });
  });
  lab.test(' "append" HEAD /has/slash redirects to /has/slash/', (done) => {
    server.inject({
      method: 'head',
      url: '/has/slash'
    }, (result) => {
      Code.expect(result.statusCode).to.equal(301);
      Code.expect(result.headers.location).to.equal('/has/slash/');
      done();
    });
  });
  lab.test(' "append"  /has/slash/ GET works with url params', (done) => {
    server.inject({
      method: 'get',
      url: '/has/slash/velvet_revolver/'
    }, (result) => {
      Code.expect(result.statusCode).to.equal(200);
      Code.expect(result.payload).to.equal('slither');
      done();
    });
  });

  lab.test(' "append" /has/slash GET redirects with url params ', (done) => {
    server.inject({
      method: 'get',
      url: '/has/slash/velvet_revolver?temp=hi'
    }, (result) => {
      Code.expect(result.statusCode).to.equal(301);
      Code.expect(result.headers.location).to.equal('/has/slash/velvet_revolver/?temp=hi');
      done();
    });
  });
  lab.test(' "append" /has/slash POST redirect is ignored ', (done) => {
    server.inject({
      method: 'post',
      url: '/has/slash/velvet_revolver?temp=hi'
    }, (result) => {
      Code.expect(result.statusCode).to.equal(404);
      done();
    });
  });

  lab.test('processes routes on preResponse ', (allDone) => {
    let called = 0;
    server.ext('onRequest', (request, reply) => {
      called++;
      reply.continue();
    });
    async.autoInject({
      route(done) {
        server.route({
          method: 'POST',
          path: '/myRoute/',
          handler: (request, reply) => {
            reply('2017');
          }
        });
        done();
      },
      injectHit(route, done) {
        server.inject({
          method: 'POST',
          url: '/myRoute/'
        }, (result) => {
          Code.expect(result.statusCode).to.equal(200);
          done();
        });
      },
      injectMiss(route, done) {
        server.inject({
          method: 'POST',
          url: '/post/'
        }, (result) => {
          Code.expect(result.statusCode).to.equal(404);
          done();
        });
      },
      injectMiss2(route, done) {
        server.inject({
          method: 'POST',
          url: '/myRoute'
        }, (result) => {
          Code.expect(result.statusCode).to.equal(404);
          done();
        });
      },
      injectRedirect(route, done) {
        server.inject({
          method: 'GET',
          url: '/myRoute'
        }, (result) => {
          Code.expect(result.statusCode).to.equal(301);
          done();
        });
      },
      verify(injectMiss, injectHit, injectMiss2, injectRedirect, done) {
        Code.expect(called).to.equal(4);
        done();
      }
    }, allDone);
  });
});
