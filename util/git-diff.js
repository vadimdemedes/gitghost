'use strict';

/**
 * Dependencies
 */

const Promise = require('bluebird');
const git = require('nodegit');


/**
 * Expose fn
 */

module.exports = gitDiff;


/**
 * git diff
 */

function gitDiff (path, prevCommit, nextCommit) {
  let repository, commits;

  return git.Repository.open(path)
    .then(function (result) {
      repository = result;

      let commits = [
        getCommit(repository, prevCommit),
        getCommit(repository, nextCommit)
      ];

      return Promise.all(commits);
    })
    .then(function (result) {
      commits = result;

      let trees = commits.map(function (commit) {
        return commit.getTree();
      });

      return Promise.all(trees);
    })
    .then(function (trees) {
      return git.Diff.treeToTree(repository, trees[0], trees[1]);
    })
    .then(function (diff) {
      return diff.patches()
        .then(function (patches) {
          return patches.map(function (patch) {
            return {
              path: patch.newFile().path(),
              isAdded: patch.isAdded(),
              isDeleted: patch.isDeleted(),
              isModified: patch.isModified()
            };
          });
        });
    })
    .then(function (diff) {
      commits.forEach(function (commit) {
        commit.free();
      });

      repository.free();

      return diff;
    });
}


/**
 * Helpers
 */

function getCommit (repo, hash) {
  if (hash === 'HEAD') {
    return repo.getHeadCommit();
  }

  if (hash) {
    return repo.getCommit(hash);
  }

  return {
    getTree: noop,
    free: noop
  };
}

function noop () {}
