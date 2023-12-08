FROM docker.io/node:current

WORKDIR /workspace/

COPY ./package.json .

RUN npm install
