# git:ghost

Publish posts to your Ghost blog via git.

<h1 align="center">
  <br>
  <a href="http://gitghost.org"><img width="200" src="media/logo.png"></a>
  <br>
  <br>
  <br>
</h1>

git:ghost builds a git repository of your blog posts. Then, use it like any other git repository.
To create a post, add new file. Change file and post gets updated. Remove file and post will be removed.


### Usage

**Hosted**:

git:ghost is hosted on *git.gitghost.org* (see http://gitghost.org).


**Programmatically**:

```
$ npm install gitghost --save
```

```js
const gitghost = require('gitghost');

// gitghost is an instance of http.Server
gitghost.listen(3000);
```

**Docker**:

```
$ docker run --env-file .env -e PORT=3000 -p 3000:3000 vdemedes/gitghost
```

where `.env` is a file with environment variables (see [example.env](https://github.com/vdemedes/gitghost/blob/master/example.env)).


### Tests

TODO.


### License

MIT © [vdemedes](https://github.com/vdemedes)
