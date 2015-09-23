'use strict';

/**
 * Dependencies
 */

const knox = require('knox');


/**
 * Set up S3 client
 */

if (!process.env.S3_BUCKET) {
  throw new Error('S3_BUCKET is not set in the environment');
}

if (!process.env.S3_SECRET) {
  throw new Error('S3_SECRET is not set in the environment');
}

if (!process.env.S3_KEY) {
  throw new Error('S3_KEY is not set in the environment');
}

let client = knox.createClient({
  bucket: process.env.S3_BUCKET,
  secret: process.env.S3_SECRET,
  key: process.env.S3_KEY
});


/**
 * Expose s3 client
 */

module.exports = client;
