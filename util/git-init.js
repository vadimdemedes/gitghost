'use strict';

/**
 * Dependencies
 */

const exec = require('mz/child_process').execFile;
const fs = require('mz/fs');


/**
 * Expose fn
 */

module.exports = gitInit;


/**
 * Init a bare repository
 */

function gitInit (path) {
  return fs.stat(path)
    .catch(function () {
      return exec('git', ['init', '--bare', path]);
    });
}
