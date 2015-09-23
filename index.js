'use strict';

/**
 * Dependencies
 */

const basicAuth = require('basic-auth');
const pushover = require('pushover');
const bugsnag = require('bugsnag');
const encode = require('git-side-band-message');
const format = require('util').format;
const join = require('path').join;
const http = require('http');
const co = require('co');

const pull = require('./lib/pull');
const push = require('./lib/push');


/**
 * Expose `gitghost`
 */

module.exports = gitghost;


/**
 * Configuration
 */

let server = pushover(join(__dirname, 'repos'), {
  autoCreate: true,
  checkout: false
});


/**
 * Handle fetch
 */

server.on('info', function (context) {
  co.call(context, pull).catch(function (err) {
    context.reject();

    errorHandler(err);
  });
});

server.on('push', function (context) {
  if (context.branch !== 'master') {
    return context.reject();
  }

  context.on('response', function (res, done) {
    // helper function to write output
    context.write = function () {
      let message = format.apply(null, arguments);
      message = encode(message + '\n');

      res.queue(message);
    };

    // done() to end request
    context.done = done;

    co.call(context, push).catch(function (err) {
      done();

      errorHandler(err);
    });
  });

  context.accept();
});


/**
 * Error handling
 */

function errorHandler (err) {
  console.log(err.stack);

  bugsnag.notify(err);
}



/**
 * Publish posts to your Ghost blog via git
 */

function gitghost () {
  return http.createServer(function (req, res) {
    let credentials = basicAuth(req);

    if (!credentials) {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="gitghost"');
      res.end();
      return;
    }

    req.user = {
      email: credentials.name,
      password: credentials.pass
    };

    server.handle(req, res);
  });
}
