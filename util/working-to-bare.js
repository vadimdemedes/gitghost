'use strict';

/**
 * Dependencies
 */

const promisify = require('pify');
const tempfile = require('tempfile');
const exec = require('mz/child_process').execFile;
const join = require('path').join;
const rm = promisify(require('rimraf'));
const mv = promisify(require('mv'));


/**
 * Expose fn
 */

module.exports = workingToBare;


/**
 * Convert working repository to bare
 */

function workingToBare (path) {
  let tmpPath = tempfile();

  return mv(path, tmpPath)
    .then(function () {
      return mv(join(tmpPath, '.git'), path);
    })
    .then(function () {
      let options = {
        cwd: path
      };

      return exec('git', ['config', '--local', '--bool', 'core.bare', 'true'], options);
    })
    .then(function () {
      return rm(tmpPath);
    });
}
