FROM node:20-slim AS base
ARG PORT=3000
ENV PORT=${PORT}

USER root

# set -xe : -e abort on error : -x verbose output
RUN set -xe \
  && apt-get update && apt-get upgrade \
  && mkdir -p /home/node/app

# Create app directory
WORKDIR /home/node/app

# Copy the basic directories/files across
RUN mkdir -p dist
COPY --chown=root:root package*.json .
COPY --chown=root:root ./index.js .
COPY --chown=root:root ./client ./client
COPY --chown=root:root ./server ./server
COPY --chown=root:root ./bin ./bin
COPY --chown=root:root ./config ./config
COPY --chown=root:root ./webpack.config.mjs ./webpack.config.mjs
COPY --chown=root:root ./babel.config.json ./babel.config.json
COPY --chown=root:root ./OSTN15_NTv2_OSGBtoETRS.gsb ./OSTN15_NTv2_OSGBtoETRS.gsb

ARG BUILD_VERSION=v3.0.0-1-g6666666
ARG GIT_COMMIT=0
RUN echo "module.exports = { version: '$BUILD_VERSION', revision: '$GIT_COMMIT' }" > ./version.js

FROM base AS development 

# Temporarily disable the postinstall NPM script
RUN npm pkg set scripts.postinstall="echo no-postinstall" \
&& npm ci --omit dev \
&& npm run build

USER node
EXPOSE ${PORT}/tcp
CMD [ "node", "index.js" ]

FROM base AS production 

# Temporarily disable the postinstall NPM script
RUN npm pkg set scripts.postinstall="echo no-postinstall" \
&& npm ci --omit dev \
&& npm run build

USER node
EXPOSE ${PORT}/tcp
CMD [ "node", "index.js" ]