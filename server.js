'use strict';

/**
 * Error reporting
 */

const bugsnag = require('bugsnag');

bugsnag.register(process.env.BUGSNAG_API_KEY, {
  appVersion: require('./package.json').version,
  notifyReleaseStages: ['production', 'staging']
});


/**
 * Dependencies
 */

const gitghost = require('./');


/**
 * Configuration
 */

const port = process.env.PORT || 3000;


/**
 * Start a server
 */

gitghost().listen(port);
