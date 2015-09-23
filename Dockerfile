FROM node:latest

WORKDIR /usr/src/app

ADD package.json ./
RUN npm install --production && \
    cd node_modules/nodegit && \
    npm install && \
    npm install node-gyp && \
    node lifecycleScripts/install
ADD . .
RUN rm -rf repos && \
    mkdir repos

CMD ["npm", "start"]
