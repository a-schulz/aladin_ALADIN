FROM node

WORKDIR /server
RUN ls -l
# RUN npm i
RUN npm i -g ts-node
RUN cd src/Legacy/server/serverLTI.ts

CMD ts-node serverLTI.ts