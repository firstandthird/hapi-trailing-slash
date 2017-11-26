'use strict';
const Code = require('code');   // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Hapi = require('hapi');
const theModule = require('../index.js');

lab.experiment('hapi-trailing-slash', () => {
  let server;

  lab.beforeEach(async() => {
    server = new Hapi.Server();
    server.route([
      {
        method: 'GET',
        path: '/',
        handler: (request, h) => {
          return 'root';
        }
      },
      {
        method: 'GET',
        path: '/no/slash',
        handler: (request, h) => {
          return 'chinese democracy';
        }
      },
      {
        method: 'GET',
        path: '/no/slash/{band}',
        handler: (request, h) => {
          if (request.params.band === 'gnr') {
            return 'sweet child of mine ';
          } else if (request.params.band === 'velvet_revolver') {
            return 'slither';
          } else {
            return 'not found';
          }
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
            return 'sweet child of mine';
          } else if (request.params.band === 'velvet_revolver') {
            return 'slither';
          } else {
            return 'not found';
          }
        }
      }
    ]);

    await server.register({
      plugin: theModule,
      options: {
        method: 'remove',
        verbose: true
      }
    });
    await server.start();
  });

  lab.afterEach(async() => {
    await server.stop();
  });

  lab.test(' "remove" /no/slash when called correctly returns 200', async() => {
    const result = await server.inject({
      method: 'get',
      url: '/no/slash'
    });
    Code.expect(result.statusCode).to.equal(200);
    Code.expect(result.payload).to.equal('chinese democracy');
  });

  lab.test(' "remove" /no/slash/ works normally if that route is specified', async() => {
    server.route({
      path: '/no/slash/',
      method: 'get',
      handler(request, reply) {
        return 'chinese democracy';
      }
    });
    const result = await server.inject({
      method: 'get',
      url: '/no/slash/'
    });
    Code.expect(result.statusCode).to.equal(200);
    Code.expect(result.payload).to.equal('chinese democracy');
  });

  lab.test(' "remove" /no/slash/ when called with trailing slash returns 301 Redirect to /no/slash', async() => {
    let called = 0;
    server.ext('onRequest', (request, h) => {
      called++;
      return h.continue;
    });
    const result = await server.inject({
      method: 'get',
      url: '/no/slash/'
    });
    Code.expect(result.statusCode).to.equal(301);
    Code.expect(result.headers.location).to.equal('/no/slash');
    Code.expect(called).to.equal(1);
  });

  lab.test(' "remove" HEAD /no/slash/ redirects to /no/slash', async() => {
    const result = await server.inject({
      method: 'head',
      url: '/no/slash/'
    });
    Code.expect(result.statusCode).to.equal(301);
    Code.expect(result.headers.location).to.equal('/no/slash');
  });

  lab.test(' "remove" /no/slash GET works normally with route params', async() => {
    const result = await server.inject({
      method: 'get',
      url: '/no/slash/velvet_revolver?p1=hi'
    });
    Code.expect(result.statusCode).to.equal(200);
    Code.expect(result.payload).to.equal('slither');
  });

  lab.test(' "remove" /no/slash GET redirects with url params ', async() => {
    const result = await server.inject({
      method: 'get',
      url: '/no/slash/velvet_revolver/?p1=hi'
    });
    Code.expect(result.statusCode).to.equal(301);
    Code.expect(result.headers.location).to.equal('/no/slash/velvet_revolver?p1=hi');
  });

  lab.test(' "remove" /no/slash POST is ignored with url params ', async() => {
    const result = await server.inject({
      method: 'post',
      url: '/no/slash/velvet_revolver/?p1=hi'
    });
    Code.expect(result.statusCode).to.equal(404);
  });

  lab.test(' "remove" / (root path) is not stripped ', async() => {
    const result = await server.inject({
      method: 'get',
      url: '/'
    });
    Code.expect(result.statusCode).to.equal(200);
    Code.expect(result.payload).to.equal('root');
  });
});
