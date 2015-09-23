'use strict';

/**
 * Dependencies
 */

const promisify = require('pify');
const basename = require('path').basename;
const format = require('util').format;
const crypto = require('crypto');
const ghost = require('ghost-api');
const each = require('array-generators').forEach;
const join = require('path').join;
const rm = promisify(require('rimraf'));
const fs = require('mz/fs');

const redis = require('./redis');

const bareToWorking = require('../util/bare-to-working');
const workingToBare = require('../util/working-to-bare');
const getHeadCommit = require('../util/get-head-commit');
const parsePost = require('../util/parse-post');
const gitDiff = require('../util/git-diff');
const upload = require('../util/upload-directory');


/**
 * Expose fn
 */

module.exports = push;


/**
 * git push
 */

function * push () {
  let self = this;

  this.write('-----> git:ghost is receiving push');

  let host = this.repo.replace('.git', '');
  let path = this.cwd;

  // create a ghost api client for this blog
  let client = ghost(host);

  // authorize a client
  yield client.auth(this.request.user.email, this.request.user.password);

  this.write('       blog: http://' + host);

  // get HEAD commit from the previous repository state
  // key is the md5ed blog host
  let key = crypto.createHash('md5').update(host).digest('hex');
  let commit = yield redis.get(key);

  // diff between current HEAD and last known HEAD
  let diff = yield gitDiff(path, commit, 'HEAD');

  // convert to repo with a working tree
  // to easily read files
  yield bareToWorking(path);

  // create/update/delete posts
  yield each(diff, function * (file) {
    let filePath = join(path, file.path);
    let slug = basename(file.path, '.md');

    if (file.isAdded) {
      let post = yield createPost(client, filePath);

      self.write('-----> New post "' + post.title + '"');
      self.write('       status: ' + post.status);
      self.write('       slug: ' + slug);

      if (post.status === 'published') {
        self.write('       url: http://' + host + '/' + slug + '/');
      }
    }

    if (file.isModified) {
      let post = yield updatePost(client, filePath);

      self.write('-----> Updated post "' + post.title + '"');
      self.write('       status: ' + post.status);
      self.write('       slug: ' + slug);

      if (post.status === 'published') {
        self.write('       url: http://' + host + '/' + slug + '/');
      }
    }

    if (file.isDeleted) {
      let post = yield deletePost(client, filePath);

      self.write('-----> Deleted post "' + post.title + '"');
    }
  });

  // convert back to bare repository
  // to ensure same state
  yield workingToBare(path);

  // save current HEAD
  commit = yield getHeadCommit(path);

  yield redis.set(key, commit);

  // save repository to S3
  let remotePath = format('/%s.tar.gz', host);
  yield upload(path, remotePath);

  // remove repository
  yield rm(path);

  this.write('-----> All done!');
  this.write('-----> Blog url: http://' + host);
  this.write('-----> Admin url: http://' + host + '/ghost');

  this.done();
}


/**
 * Helpers
 */

function createPost (client, path) {
  return fs.readFile(path, 'utf-8')
    .then(function (source) {
      let post = parsePost(source);

      post.slug = basename(path, '.md');
      post.status = post.status || 'draft';

      return client.posts.create(post);
    });
}

function deletePost (client, path) {
  let slug = basename(path, '.md');

  return client.posts.findOne(slug)
    .then(function (post) {
      return client.posts.destroy(post.id);
    });
}

function updatePost (client, path) {
  let slug = basename(path, '.md');
  let id;

  return client.posts.findOne(slug)
    .then(function (post) {
      id = post.id;

      return fs.readFile(path, 'utf-8');
    })
    .then(function (source) {
      let post = parsePost(source);

      post.status = post.status || 'draft';

      return client.posts.update(id, post);
    });
}
