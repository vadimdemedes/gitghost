'use strict';

/**
 * Dependencies
 */

const git = require('nodegit');


/**
 * Expose fn
 */

module.exports = getHeadCommit;


/**
 * Get HEAD commit
 */

function getHeadCommit (path) {
  let repository;

  return git.Repository.open(path)
    .then(function (repo) {
      repository = repo;

      return repository.getHeadCommit();
    })
    .then(function (commit) {
      let hash = commit.sha();

      commit.free();
      repository.free();

      return hash;
    });
}
