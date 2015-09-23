'use strict';

/**
 * Dependencies
 */

const promisify = require('pify');
const crypto = require('crypto');
const format = require('util').format;
const ghost = require('ghost-api');
const rm = promisify(require('rimraf'));

const buildRepository = require('./build-repository');
const redis = require('./redis');

const getHeadCommit = require('../util/get-head-commit');
const bareToWorking = require('../util/bare-to-working');
const workingToBare = require('../util/working-to-bare');
const download = require('../util/download-directory');
const gitInit = require('../util/git-init');
const gitAdd = require('../util/git-add');
const upload = require('../util/upload-directory');


/**
 * Expose fn
 */

module.exports = pull;


/**
 * Fetch/build a repository of posts
 */

function * pull () {
  // blog host (e.g. blog.roqet.io)
  let host = this.repo.replace('.git', '');

  // `path` looks better than `cwd`
  let path = this.cwd;

  // create a ghost api client for this blog
  let client = ghost(host);

  // get authentication token
  yield client.auth(this.request.user.email, this.request.user.password);

  // remove previous repository
  yield rm(path);

  // download saved repository from S3 (if any)
  // if download fails, then there's probably nothing there
  let remotePath = format('/%s.tar.gz', host);
  yield download(remotePath, path).catch(function () {});

  // if repository does not exist, create it
  yield gitInit(path);

  // convert bare repo to a repo with a working tree
  yield bareToWorking(path);

  // fetch all blog posts
  // and write them to fs
  let posts = yield client.posts.all();

  yield buildRepository(path, posts);

  // add all changes and commit them
  yield gitAdd(path, 'updates from ghost admin panel');

  // convert to bare repository back
  yield workingToBare(path);

  // save all changes on S3
  yield upload(path, remotePath);

  // save HEAD commit hash
  // so that we know where we need to diff from
  // when updates are being sent (git push)
  let commit = yield getHeadCommit(path);
  let key = crypto.createHash('md5').update(host).digest('hex');

  yield redis.set(key, commit);

  this.accept();
}
