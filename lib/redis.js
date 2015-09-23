'use strict';

/**
 * Dependencies
 */

const promisify = require('pify');
const parse = require('url').parse;
const redis = require('redis');


/**
 * Set up Redis client
 */

let url = parse(process.env.REDIS_URL);

if (!url) {
  throw new Error('REDIS_URL is not set in the environment');
}

let options = {
  auth_pass: url.auth
};

let client = redis.createClient(+url.port, url.hostname, options);

client.get = promisify(client.get);
client.set = promisify(client.set);


/**
 * Expose client
 */

module.exports = client;
