FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production --no-package-lock
COPY . .
EXPOSE 3000
CMD node server.js> normal.log 2> error.log