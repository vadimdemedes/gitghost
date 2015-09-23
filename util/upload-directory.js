'use strict';

/**
 * Dependencies
 */

const promisify = require('pify');
const tempfile = require('tempfile');
const zlib = require('zlib');
const tar = require('tar-fs');
const fs = require('fs');

const s3 = require('../lib/s3');


/**
 * Expose fn
 */

module.exports = promisify(uploadDirectory);


/**
 * Archive and upload directory to S3
 */

function uploadDirectory (localPath, remotePath, done) {
  let tmpPath = tempfile();
  let tmpStream = fs.createWriteStream(tmpPath);
  let gzipStream = zlib.createGzip();

  tar.pack(localPath)
    .pipe(gzipStream)
    .pipe(tmpStream)
    .on('error', done)
    .on('finish', function () {
      s3.putFile(tmpPath, remotePath, done);
    });
}
