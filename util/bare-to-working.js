'use strict';

/**
 * Dependencies
 */

const promisify = require('pify');
const tempfile = require('tempfile');
const exec = require('mz/child_process').execFile;
const join = require('path').join;
const mv = promisify(require('mv'));


/**
 * Expose fn
 */

module.exports = bareToWorking;


/**
 * Convert bare repository to working
 */

function bareToWorking (path) {
  let tmpPath = tempfile();

  return mv(path, tmpPath)
    .then(function () {
      return mv(tmpPath, join(path, '.git'), { mkdirp: true });
    })
    .then(function () {
      let options = {
        cwd: path
      };

      return exec('git', ['config', '--local', '--bool', 'core.bare', 'false'], options);
    })
    .then(function () {
      let options = {
        cwd: path
      };

      return exec('git', ['reset', '--hard'], options);
    });
}
