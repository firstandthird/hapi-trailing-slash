'use strict';
const Code = require('code');   // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Hapi = require('hapi');
const theModule = require('../index.js');

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
        method: 'POST',
        path: '/has/slash/{band}/',
        handler: (request, reply) => {
          if (request.params.band === 'gnr') {
            reply('sweet child of mine');
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
        method: 'smart',
        verbose: true
      }
    }, (err) => {
      server.start(done);
    });
  });

  lab.afterEach((done) => {
    server.stop(done);
  });

  lab.test(' "smart" /no/slash/ same as /no/slash', (done) => {
    server.inject({
      method: 'get',
      url: '/no/slash/'
    }, (result) => {
      Code.expect(result.statusCode).to.equal(200);
      Code.expect(result.payload).to.equal('welcome to the jungle');
      done();
    });
  });
  lab.test(' "smart" /no/slash same as /no/slash', (done) => {
    server.inject({
      method: 'get',
      url: '/no/slash'
    }, (result) => {
      Code.expect(result.statusCode).to.equal(200);
      Code.expect(result.payload).to.equal('welcome to the jungle');
      done();
    });
  });
  lab.test(' "smart" /has/slash same as /has/slash/', (done) => {
    server.inject({
      method: 'get',
      url: '/has/slash'
    }, (result) => {
      Code.expect(result.statusCode).to.equal(200);
      Code.expect(result.payload).to.equal('slither');
      done();
    });
  });
  lab.test(' "smart" /has/slash redirect preserves query params', (done) => {
    server.inject({
      method: 'get',
      url: '/has/slash?param1=hi'
    }, (result) => {
      Code.expect(result.statusCode).to.equal(200);
      Code.expect(result.payload).to.equal('slither');
      done();
    });
  });
  lab.test(' "smart" /has/slash/ POST works with url params ', (done) => {
    server.inject({
      method: 'post',
      url: '/has/slash/velvet_revolver/'
    }, (result) => {
      Code.expect(result.statusCode).to.equal(200);
      Code.expect(result.payload).to.equal('slither');
      done();
    });
  });
  lab.test(' "smart" /has/slash POST redirects with url params ', (done) => {
    server.inject({
      method: 'post',
      url: '/has/slash/gnr'
    }, (result) => {
      Code.expect(result.statusCode).to.equal(200);
      Code.expect(result.payload).to.equal('sweet child of mine');
      done();
    });
  });
});
