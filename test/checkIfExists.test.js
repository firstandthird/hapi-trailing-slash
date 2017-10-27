'use strict';
const Code = require('code');   // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Hapi = require('hapi');
const theModule = require('../index.js');

lab.experiment('hapi-trailing-slash checkIfExists', () => {
  let server;

  lab.beforeEach((done) => {
    server = new Hapi.Server();
    server.connection();

    server.route([
      {
        method: 'GET',
        path: '/no/slash',
        handler: (request, reply) => {
          reply('chinese democracy');
        }
      },
      {
        method: 'GET',
        path: '/has/slash/',
        handler: (request, reply) => {
          reply('slither');
        }
      },
    ]);

    server.register({
      register: theModule,
      options: {
        checkIfExists: true,
        method: 'remove',
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

  lab.test(' checkIfExists will do a HEAD check that the forward exists', (done) => {
    server.inject({
      method: 'get',
      url: '/no/slash/'
    }, (result) => {
      Code.expect(result.statusCode).to.equal(404);
      server.inject({
        method: 'get',
        url: '/has/slash/'
      }, (result2) => {
        Code.expect(result2.statusCode).to.equal(200);
        done();
      });
    });
  });
});
