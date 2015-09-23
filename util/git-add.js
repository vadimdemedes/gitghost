'use strict';

/**
 * Dependencies
 */

const exec = require('mz/child_process').execFile;


/**
 * Expose fn
 */

module.exports = gitAdd;


/**
 * Add and commit new files (if any)
 */

function gitAdd (path, message) {
  let options = {
    cwd: path
  };

  return exec('git', ['add', '.'], options)
    .then(function () {
      return exec('git', ['add', '-u'], options);
    })
    .then(function () {
      return exec('git', ['commit', '-m', message], options).catch(function () {});
    });
}
