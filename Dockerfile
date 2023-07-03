FROM node:20.3.1

RUN npm i -g ts-node
WORKDIR /server
ADD package.json package-lock.json ./
RUN npm install
ADD ./src ./

CMD ts-node --transpileOnly ./Legacy/server/serverLTI.ts