'use strict';

/**
 * Dependencies
 */

const Promise = require('bluebird');
const ltrim = require('trim').left;
const join = require('path').join;
const fs = require('mz/fs');


/**
 * Expose fn
 */

module.exports = buildRepository;


/**
 * Build repository
 */

function buildRepository (repoPath, posts) {
  let writes = posts.map(function (post) {
    return writePost(repoPath, post);
  });

  return Promise.all(writes);
}

function writePost (repoPath, post) {
  let path = join(repoPath, post.slug + '.md');

  let attributes = [
    '---',
    'title: ' + post.title,
    'status: ' + post.status,
    '---',
    ''
  ].join('\n');

  let content = attributes + ltrim(post.markdown);

  return fs.writeFile(path, content);
}
