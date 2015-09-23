'use strict';

/**
 * Dependencies
 */

const promisify = require('pify');
const zlib = require('zlib');
const tar = require('tar-fs');

const s3 = require('../lib/s3');


/**
 * Expose fn
 */

module.exports = promisify(uploadDirectory);


/**
 * Archive and upload directory to S3
 */

function uploadDirectory (remotePath, localPath, done) {
  s3.get(remotePath)
    .on('error', done)
    .on('response', function (res) {
      let gunzipStream = zlib.createGunzip();
      let untarStream = tar.extract(localPath);

      gunzipStream.on('error', done);
      untarStream.on('error', done);
      res.on('error', done);

      res.pipe(gunzipStream)
        .pipe(tar.extract(localPath))
        .on('finish', done);
    }).end();
}
