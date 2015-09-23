'use strict';

/**
 * Dependencies
 */

const frontMatter = require('front-matter');
const ltrim = require('trim').left;


/**
 * Expose fn
 */

module.exports = parsePost;


/**
 * Parse post source and return attributes for Ghost API
 */

function parsePost (source) {
  let parsed = frontMatter(source);

  let post = parsed.attributes;
  post.title = post.title || 'Without title';
  post.markdown = ltrim(parsed.body);

  return post;
}
