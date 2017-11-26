'use strict';
const Code = require('code');   // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Hapi = require('hapi');
const theModule = require('../index.js');

lab.test(' checkIfExists will check the route table to verify the forward exists', async() => {
  const server = new Hapi.Server({ port: 8080 });

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
  await server.start();

  const result = await server.inject({
    method: 'get',
    url: '/no/slash/'
  });
  Code.expect(result.statusCode).to.equal(404);
  const result2 = await server.inject({
    method: 'get',
    url: '/has/slash/'
  });
  // Code.expect(result2.statusCode).to.equal(301);
  await server.stop();
});
