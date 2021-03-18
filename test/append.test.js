'use strict';
const Code = require('@hapi/code');   // assertion library
const Lab = require('@hapi/lab');
const lab = exports.lab = Lab.script();
const Hapi = require('@hapi/hapi');
const theModule = require('../index.js');

lab.experiment('hapi-trailing-slash', () => {
  let server;

  lab.beforeEach(async() => {
    server = new Hapi.Server();
    server.route([
      {
        method: 'GET',
        path: '/no/slash',
        handler: (request, h) => {
          return 'welcome to the jungle';
        }
      },
      {
        method: 'GET',
        path: '/has/slash/',
        handler: (request, h) => {
          return 'slither';
        }
      },
      {
        method: 'GET',
        path: '/has/slash/{band}/',
        handler: (request, h) => {
          if (request.params.band === 'gnr') {
            return 'sweet child of mine ';
          } else if (request.params.band === 'velvet_revolver') {
            return 'slither';
          } else {
            return 'not found';
          }
        }
      }
    ]);

    const response = await server.register({
      plugin: theModule,
      options: {
        method: 'append',
        verbose: true
      }
    });
    await server.start();
  });

  lab.afterEach(async() => {
    await server.stop();
  });

  lab.test(' "append"  /has/slash/ works normally', async() => {
    const result = await server.inject({
      method: 'get',
      url: '/has/slash/'
    });
    Code.expect(result.statusCode).to.equal(200);
    Code.expect(result.payload).to.equal('slither');
  });
  lab.test(' "append" /has/slash works normally if that route is specified', async() => {
    server.route({
      path: '/has/slash',
      method: 'get',
      handler(request, h) {
        return 'slither';
      }
    });
    const result = await server.inject({
      method: 'get',
      url: '/has/slash'
    });
    Code.expect(result.statusCode).to.equal(200);
    Code.expect(result.payload).to.equal('slither');
  });

  lab.test(' "append" GET /has/slash redirects to /has/slash/', async() => {
    const result = await server.inject({
      method: 'get',
      url: '/has/slash'
    });
    Code.expect(result.statusCode).to.equal(301);
    Code.expect(result.headers.location).to.equal('/has/slash/');
  });
  lab.test(' "append" HEAD /has/slash redirects to /has/slash/', async() => {
    const result = await server.inject({
      method: 'head',
      url: '/has/slash'
    });
    Code.expect(result.statusCode).to.equal(301);
    Code.expect(result.headers.location).to.equal('/has/slash/');
  });
  lab.test(' "append"  /has/slash/ GET works with url params', async() => {
    const result = await server.inject({
      method: 'get',
      url: '/has/slash/velvet_revolver/'
    });
    Code.expect(result.statusCode).to.equal(200);
    Code.expect(result.payload).to.equal('slither');
  });

  lab.test(' "append" /has/slash GET redirects with url params ', async() => {
    const result = await server.inject({
      method: 'get',
      url: '/has/slash/velvet_revolver?temp=hi'
    });
    Code.expect(result.statusCode).to.equal(301);
    Code.expect(result.headers.location).to.equal('/has/slash/velvet_revolver/?temp=hi');
  });
  lab.test(' "append" /has/slash POST redirect is ignored ', async() => {
    const result = await server.inject({
      method: 'post',
      url: '/has/slash/velvet_revolver?temp=hi'
    });
    Code.expect(result.statusCode).to.equal(404);
  });

  lab.test(' "append" /has/slash.png redirect is ignored ', async() => {
    const result = await server.inject({
      method: 'get',
      url: '/images/logo.png'
    });
    Code.expect(result.statusCode).to.equal(404);
  });
});
