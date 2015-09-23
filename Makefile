SRC = index.js server.js lib/*.js util/*.js

default:
	docker build -t vdemedes/gitghost .

push:
	docker push vdemedes/gitghost

include node_modules/make-lint/index.mk
