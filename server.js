const Hapi = require('hapi');
const server = new Hapi.Server();
const routes = require('./routes');
const users=require('./data/users');
server.connection({
  port: process.env.PORT
});
const logOptions = {
  reporters: {
    console: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{
          log: '*',
          response: '*',
          request: '*'

        }]
      }, {
        module: 'good-console'
      },
      'stdout'
    ]

  }
};
exports.start = function() {
  server.register({
    register: require('good'),
    options: logOptions,
  }, (err) => {

    if (err) {
      return console.error(err);
    }
    server.register({
      register: require('hapi-auth-bearer-simple')
    }, (err) => {

      if (err) {
        return console.error(err);
      }
      server.auth.strategy('bearer', 'bearerAuth', {
        validateFunction: users.validateFunction
      });





      // Add a standard route here as example
      server.route(routes);

      server.start(function(err) {

        if (err) {
          throw err;
        }
        server.log(["server"], 'Server started at: ' + server.info.uri);
      });
    });

  });
}
exports.stop = function() {
  server.stop({
    timeout: 60 * 1000
  }, (err) => {
    if (err) {
      server.error(err);
    }
    server.log('Server stopped');
  });
}
