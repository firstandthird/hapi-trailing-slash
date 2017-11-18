'use strict';
const Code = require('code');   // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Hapi = require('hapi');
const theModule = require('../index.js');

lab.experiment('hapi-trailing-slash checkIfExists', () => {
  let server;

  lab.beforeEach(async() => {
    server = new Hapi.Server();

    server.route([
      {
        method: 'GET',
        path: '/no/slash',
        handler: (request, h) => {
          return 'chinese democracy';
        }
      },
      {
        method: 'GET',
        path: '/has/slash/',
        handler: (request, h) => {
          return h.redirect('slither');
        }
      },
    ]);

    await server.register({
      plugin: theModule,
      options: {
        checkIfExists: true,
        method: 'remove',
        verbose: true
      }
    });
    await server.start(done);
  });

  lab.afterEach(async() => {
    await server.stop();
  });

  lab.test(' checkIfExists will do a HEAD check that the forward exists', async() => {
    const result = await server.inject({
      method: 'get',
      url: '/no/slash/'
    });
    Code.expect(result.statusCode).to.equal(404);
    const result2 = await server.inject({
      method: 'get',
      url: '/has/slash/'
    });
    Code.expect(result2.statusCode).to.equal(301);
  });
});
